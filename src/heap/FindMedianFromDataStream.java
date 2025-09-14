package heap;

import java.util.PriorityQueue;

public class FindMedianFromDataStream {
    PriorityQueue<Integer> leftMaxQueue = new PriorityQueue<>((a,b) -> -(a.compareTo(b)));
    PriorityQueue<Integer> rightMinQueue = new PriorityQueue<>();

    public FindMedianFromDataStream() {
    }

    public void addNum(int num) {
        if (leftMaxQueue.size() > 0 && num >= leftMaxQueue.peek()) {
            rightMinQueue.add(num);
        } else {
            leftMaxQueue.add(num);
        }
        balance();
    }

    private void balance() {
        if (leftMaxQueue.size() > rightMinQueue.size() + 1) {
            rightMinQueue.add(leftMaxQueue.remove());
        }
        if (rightMinQueue.size() > leftMaxQueue.size() + 1) {
            leftMaxQueue.add(rightMinQueue.remove());
        }
    }

    public double findMedian() {
        if (leftMaxQueue.size() > rightMinQueue.size()) {
            return leftMaxQueue.peek();
        }
        if (rightMinQueue.size() > leftMaxQueue.size()) {
            return rightMinQueue.peek();
        }
        return (leftMaxQueue.peek() + rightMinQueue.peek())/2.0;
    }
}
