package array;

public class GasStation {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int totalGas = 0;
        int totalCost = 0;
        int currentGas = 0;
        int startStation = 0;

        for (int i = 0; i < gas.length; i++) {
            totalGas += gas[i];
            totalCost += cost[i];
            currentGas += gas[i] - cost[i];

            // If current gas is negative, reset the starting station
            if (currentGas < 0) {
                startStation = i + 1;
                currentGas = 0;
            }
        }

        // If total gas is less than total cost, return -1
        return totalGas < totalCost ? -1 : startStation;
    }
}
