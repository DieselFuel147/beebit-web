#include <opencv/opencv.hpp>

#include <thread>
#include <atomic>
#include <mutex>

const uint32_t IMG_WIDTH = 640;
const uint32_t IMG_HEIGHT = 480;

std::atomic<bool> READ_FLAG;

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

    cv::namedWindow("Multithreaded OpenCV", 1);
    
    std::thread read_thread(read_camera);
    while (1) {
        //Process images as fast as possible, do retrieval in a separate thread
        cv::imshow("cam", img_read);
        if (cv::waitKey(30) >= 0) break;
    }
    READ_FLAG = false;
    
    return 0;
}
