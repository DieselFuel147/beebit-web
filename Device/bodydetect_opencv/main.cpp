#include <opencv/opencv.hpp>

#include <vector>

using namespace cv;

int main() {
    // initialization
    
    VideoCapture vcap(0);
    CascadeClassifier fd("../resources/har_body.xml");
    
    namedWindow("Face Detect", WINDOW_AUTOSIZE);
    
    UMat frame, frameGray;
    Mat canvas;
    std::vector<Rect> faces;
    while (1) {
        // processing loop
        vcap >> frame;
        cvtColor(frame, frameGray, COLOR_BGR2GRAY);
        equalizeHist(frameGray, frameGray);
        fd.detectMultiScale(frameGray, faces, 1.05, 3, 0|CASCADE_SCALE_IMAGE, Size(30, 30));
      
        frame.copyTo(canvas);
        for( size_t i = 0; i < faces.size(); i++ ) {
          rectangle(canvas, faces[i], Scalar(255, 255, 0), 5);
        }
        
        imshow("Face Detect", canvas);
        
        char c = (char) waitKey(30);
        if( c == 27 || c == 'q' || c == 'Q' ) break;
    }
    return 0;
}
