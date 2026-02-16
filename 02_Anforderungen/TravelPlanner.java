import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.stream.Collectors;

public class TravelPlanner {

    // Represents a trip with a list of destinations
    static class Trip {
        private final List<String> destinations;

        public Trip() {
            this.destinations = new ArrayList<>();
        }

        public Trip(List<String> destinations) {
            this.destinations = new ArrayList<>(destinations);
        }

        public List<String> getDestinations() {
            return new ArrayList<>(destinations);
        }

        // Functional approach: returns a NEW Trip with the added destination
        public Trip addDestination(String destination) {
            List<String> newDestinations = new ArrayList<>(this.destinations);
            newDestinations.add(destination);
            return new Trip(newDestinations);
        }

        // Functional approach: returns a NEW Trip with the destination inserted
        public Trip insertDestination(int index, String destination) {
            if (index < 0 || index > destinations.size()) {
                System.out.println("Invalid index. Returning original trip.");
                return this;
            }
            List<String> newDestinations = new ArrayList<>(this.destinations);
            newDestinations.add(index, destination);
            return new Trip(newDestinations);
        }
        
        @Override
        public String toString() {
            return String.join(" -> ", destinations);
        }
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Trip currentTrip = new Trip();

        System.out.println("Welcome to the Travel Planner!");

        while (true) {
            System.out.println("\nCurrent Trip: " + currentTrip);
            System.out.println("Options:");
            System.out.println("1. Add destination to end");
            System.out.println("2. Insert destination at specific position");
            System.out.println("3. Exit");
            System.out.print("Choose an option: ");

            String choice = scanner.nextLine();

            switch (choice) {
                case "1":
                    System.out.print("Enter destination: ");
                    String dest = scanner.nextLine();
                    currentTrip = currentTrip.addDestination(dest);
                    break;
                case "2":
                    System.out.print("Enter index to insert at (0 to " + currentTrip.getDestinations().size() + "): ");
                    try {
                        int index = Integer.parseInt(scanner.nextLine());
                        System.out.print("Enter destination: ");
                        String insertDest = scanner.nextLine();
                        currentTrip = currentTrip.insertDestination(index, insertDest);
                    } catch (NumberFormatException e) {
                        System.out.println("Invalid number format.");
                    }
                    break;
                case "3":
                    System.out.println("Final Trip: " + currentTrip);
                    return;
                default:
                    System.out.println("Invalid option.");
            }
        }
    }
}
