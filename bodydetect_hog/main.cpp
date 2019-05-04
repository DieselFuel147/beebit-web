#include <opencv/opencv.hpp>
#include <iostream>
#include <vector>
#include <chrono>

#include "nms.hpp"
#include "util.h"

int main(int argc, char **argv) {
	//std::cout << "Using OpenCV version: " << cv::CV_VERSION << std::endl;
	
	// Open a video capture stream using the given webcam
	cv::VideoCapture capture(0);
	
	capture.set(cv::CAP_PROP_FRAME_WIDTH, 320);
	capture.set(cv::CAP_PROP_FRAME_HEIGHT, 240);
	
	if (!capture.isOpened()) return 1;

	cv::namedWindow("HOG", 1);
    
	// Initialize the default HOG descriptor for humans
	cv::HOGDescriptor hog;
	hog.setSVMDetector(hog.getDefaultPeopleDetector());
	
	cv::UMat imageFrame;
	cv::Mat canvas;
	std::vector<cv::Rect> foundLocations;
	std::vector<double> foundWeights; // Weights are how confident the detector is
	std::vector<std::vector<float>> foundBoxes;
	
	// Timing information
	auto timeStart = std::chrono::high_resolution_clock::now();
	auto timeEnd = std::chrono::high_resolution_clock::now();

	while(1) {
		timeStart = std::chrono::high_resolution_clock::now();

		capture >> imageFrame;
		
		hog.detectMultiScale(imageFrame, foundLocations, foundWeights, 0, cv::Size(4, 4),
		                     cv::Size(8, 8), 1.04);
		                     
		// Apply non maxima suppression to reduce the number of boxes
		foundBoxes = rectsToBoxes(foundLocations);
		foundLocations = nms(foundBoxes, 0.65f);
		
		imageFrame.copyTo(canvas);
		// Draw bounding boxes on the image
		for (const cv::Rect &r : foundLocations) {
			cv::rectangle(canvas, r, cv::Scalar(0, 255, 0), 4);
		}
        
        cv::resize(canvas, canvas, cv::Size(1280, 720));
		// Draw the resultant bounding boxes on the screen
		cv::imshow("HOG", canvas);
		
		timeEnd = std::chrono::high_resolution_clock::now();
		std::chrono::duration<double> delta = timeEnd-timeStart;
		std::cout << "Frame Time: " << delta.count() << std::endl;
		
		char key = (char) cv::waitKey(1);
		if (key == 'q') break;
	}

	return 0;
}
