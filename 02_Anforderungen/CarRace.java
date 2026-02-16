import java.util.ArrayList;
import java.util.List;
import java.util.OptionalDouble;
import java.util.Scanner;

public class CarRace {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        List<Double> laps = new ArrayList<>();

        System.out.println("Enter lap times in seconds (type 'exit' to finish):");
        System.out.println("Note: The first lap is a warm-up and will be ignored.");

        while (true) {
            System.out.print("Enter lap time: ");
            String input = scanner.nextLine();

            if (input.equalsIgnoreCase("exit")) {
                break;
            }

            try {
                double time = Double.parseDouble(input);
                laps.add(time);
            } catch (NumberFormatException e) {
                System.out.println("Invalid number format.");
            }
        }

        if (laps.size() <= 1) {
            System.out.println("Not enough laps for calculation (minimum 2 laps required including warm-up).");
            return;
        }

        // Remove warm-up lap (first lap)
        List<Double> validLaps = laps.subList(1, laps.size());

        double totalTime = validLaps.stream().mapToDouble(Double::doubleValue).sum();
        OptionalDouble averageTime = validLaps.stream().mapToDouble(Double::doubleValue).average();

        System.out.println("\n--- Race Results ---");
        System.out.println("Warm-up lap ignored: " + laps.get(0));
        System.out.println("Total Time (excluding warm-up): " + totalTime + " seconds");
        if (averageTime.isPresent()) {
            System.out.println("Average Time per Lap: " + averageTime.getAsDouble() + " seconds");
        }
    }
}
