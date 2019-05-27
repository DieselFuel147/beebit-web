#include <opencv2/opencv.hpp>
#include <vector>

#include "util.h"

std::vector<std::vector<float>> rectsToBoxes(std::vector<cv::Rect> &source) {
	std::vector<std::vector<float>> dest;
	for (cv::Rect rect : source) {
		dest.push_back(std::vector<float>({rect.x, rect.y, rect.x+rect.width, rect.y+rect.width}));
	}
	return dest;
}
