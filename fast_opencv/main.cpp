#include <opencv/opencv.hpp>

#include <thread>
#include <atomic>
#include <mutex>
#include <iostream>

const uint32_t IMG_WIDTH = 640;
const uint32_t IMG_HEIGHT = 480;

std::atomic<bool> READ_FLAG;
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
        thread_lock.unlock();
    }
}

int main(int argc, char **argv) {
    READ_FLAG = true;
    CAM_INIT = false;

    cv::namedWindow("Multithreaded OpenCV", 1);
    
    std::thread read_thread(read_camera);
    while (1) {
        if (!CAM_INIT) continue;
    
        //Process images as fast as possible, do retrieval in a separate thread
        cv::imshow("cam", img_read);
        
        char result = (char) cv::waitKey(30);
        
        if (result == 'q') break;
    }
    READ_FLAG = false;
    
    return 0;
}
