#include <opencv/opencv.hpp>

#include <thread>
#include <atomic>
#include <mutex>
#include <iostream>
#include <vector>
#include <chrono>

const uint32_t IMG_WIDTH = 640;
const uint32_t IMG_HEIGHT = 480;

std::atomic<bool> READ_FLAG;
std::atomic<bool> PROCESS_FLAG;
std::atomic<bool> CAM_INIT;

cv::Mat img_read;
std::mutex thread_lock;

// Drop down to c function pointers for read task
void read_camera() {
    // Open the capture device
    cv::VideoCapture capture(0);
    
    if (!capture.isOpened()) {
        return;
    }
    
    thread_lock.lock();
    capture >> img_read;
    CAM_INIT = true;
    thread_lock.unlock();
    
    while (READ_FLAG) {
        // Perform the blocking operation of transferring the image data
        cv::Mat image;
        capture >> image;
        
        thread_lock.lock();
        img_read = image;
        PROCESS_FLAG = false;
        thread_lock.unlock();
    }
}

void detect_faces(cv::CascadeClassifier &classifier, std::vector<cv::Rect> &detect, cv::UMat &detector) {
    if (!PROCESS_FLAG) {
        img_read.copyTo(detector);
    
        // The latest image hasn't yet been processed
        classifier.detectMultiScale(detector, detect);

        for (const cv::Rect &r : detect) {
            cv::rectangle(img_read, r, cv::Scalar(0, 0, 255));
        }
        
        PROCESS_FLAG = true;
    }
}

int main(int argc, char **argv) {
    READ_FLAG = true;
    CAM_INIT = false;
    PROCESS_FLAG = false;
    
    uint32_t frame_count = 0;
    
    // HAAR cascade setup
    cv::CascadeClassifier face_classify("../resources/har_face.xml");
    std::vector<cv::Rect> classified;
    cv::UMat detector;
    
    // Timing
    auto start = std::chrono::high_resolution_clock::now();
    auto finish = std::chrono::high_resolution_clock::now();
    
    auto absStart = start;
    std::thread read_thread(read_camera);
    while (1) {
        start = std::chrono::high_resolution_clock::now();
        if (!CAM_INIT) continue;
        
        detect_faces(face_classify, classified, detector);
        
        //Process images as fast as possible, do retrieval in a separate thread
        cv::imshow("cam", img_read);
        
        char result = (char) cv::waitKey(20);
        
        if (result == 'q') break;
        finish = std::chrono::high_resolution_clock::now();
        
        std::chrono::duration<double> elapsed = finish - start;
        std::cout << "FPS: " << 1.0/elapsed.count() << std::endl;
        frame_count++;
    }
    READ_FLAG = false;
    
    std::chrono::duration<double> elapsedTotal = finish - absStart;
    std::cout << "Average FPS: " << 1.0/(elapsedTotal.count()/frame_count) << std::endl;
    
    return 0;
}
