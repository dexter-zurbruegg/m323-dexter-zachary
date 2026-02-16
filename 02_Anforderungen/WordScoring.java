import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Scanner;

public class WordScoring {

    static class WordScore {
        String word;
        int score;

        public WordScore(String word, int score) {
            this.word = word;
            this.score = score;
        }

        @Override
        public String toString() {
            return word + " (" + score + ")";
        }
    }

    public static int calculateScore(String word) {
        int score = 0;
        for (char c : word.toLowerCase().toCharArray()) {
            if (c != 'a') {
                score++;
            }
        }
        return score;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        List<WordScore> words = new ArrayList<>();

        System.out.println("Enter words to score (type 'exit' to finish):");

        while (true) {
            System.out.print("Enter word: ");
            String input = scanner.nextLine();

            if (input.equalsIgnoreCase("exit")) {
                break;
            }

            int score = calculateScore(input);
            words.add(new WordScore(input, score));
        }

        System.out.println("\n--- Results (Sorted by Score) ---");
        words.stream()
                .sorted(Comparator.comparingInt((WordScore ws) -> ws.score).reversed())
                .forEach(System.out::println);
    }
}
