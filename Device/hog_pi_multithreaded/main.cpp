#include <opencv2/opencv.hpp>
#include <raspicam/raspicam_cv.h>

#include <iostream>
#include <vector>
#include <chrono>
#include <thread>

#include <atomic>
#include <mutex>

#include "nms.hpp"
#include "util.h"

std::atomic<bool> PROCESS_FINISHED;
std::atomic<bool> READ_FLAG;

std::mutex thread_lock;
cv::Mat img_read;

struct ProcessResult {
	std::vector<cv::Rect> foundLocations;
	std::vector<double> foundWeights; // Weights are how confident the detector is
	std::vector<std::vector<float>> foundBoxes;
};

ProcessResult latest_result;

void process_image() {
	// Processes the images on a separate thread as quickly as possible
	// This means we can still get a camera feed in real time
    
	// Initialize the default HOG descriptor for humans
	cv::HOGDescriptor hog;
	hog.setSVMDetector(hog.getDefaultPeopleDetector());
	
	cv::Mat current_image;
	ProcessResult current_result;
	while (READ_FLAG) {
		std::cout << "Process Phase" << std::endl;
		PROCESS_FINISHED = false;

		if (img_read.empty()) {
			PROCESS_FINISHED = true;			
			continue;
		}
		
		img_read.copyTo(current_image);

		hog.detectMultiScale(current_image, current_result.foundLocations, current_result.foundWeights, 0, cv::Size(4, 4),
	             cv::Size(8, 8), 1.04);
		
		// Apply non maxima suppression to reduce the number of boxes
		current_result.foundBoxes = rectsToBoxes(current_result.foundLocations);
		current_result.foundLocations = nms(current_result.foundBoxes, 0.65f);
		
		thread_lock.lock();
		latest_result = current_result;
		PROCESS_FINISHED = true;
		std::cout << "Completed a detection: " << current_result.foundLocations.size() << std::endl;	
		thread_lock.unlock();
		
	}
	std::cout << "Process thread terminated." << std::endl;
}

int main(int argc, char **argv) {
	std::cout << "Using OpenCV version: " << CV_VERSION << std::endl;
	READ_FLAG = true;
	PROCESS_FINISHED = false;
	
	// Open a video capture stream using the given camera
	raspicam::RaspiCam_Cv camera;
	
	camera.set(cv::CAP_PROP_FRAME_WIDTH, 320);
	camera.set(cv::CAP_PROP_FRAME_HEIGHT, 240);
	
	if (!camera.open()) {
		std::cerr << "Error opening camera." << std::endl;
		return 1;
	}

	cv::namedWindow("HOG", 1);
	
	// Timing information
	auto timeStart = std::chrono::high_resolution_clock::now();
	auto timeEnd = std::chrono::high_resolution_clock::now();
	
	std::thread detect_thread(process_image);
	cv::Mat img_local;
	while(1) {
		timeStart = std::chrono::high_resolution_clock::now();
		
		camera.grab();		
		camera.retrieve(img_local);		

		// Draw bounding boxes on the image
		for (const cv::Rect &r : latest_result.foundLocations) {
			cv::rectangle(img_local, r, cv::Scalar(0, 255, 0), 4);
		}
        
		// Draw the resultant bounding boxes on the screen
		cv::imshow("HOG", img_local);

		thread_lock.lock();
		img_local.copyTo(img_read);
		thread_lock.unlock();
		
		timeEnd = std::chrono::high_resolution_clock::now();
		std::chrono::duration<double> delta = timeEnd-timeStart;
		std::cout << "Frame Time: " << delta.count() << std::endl;
		
		char key = (char) cv::waitKey(1);
		if (key == 'q') break;
	}
	READ_FLAG = false;

	return 0;
}
