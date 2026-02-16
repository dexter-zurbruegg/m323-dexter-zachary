public class Score {

    // Imperative Lösung
    public static int calculateScore(String word){
        int score = 0;
        for (char c : word.toCharArray()) {
            if (c != 'a') {
                score++;
            }
        }
        return score;
    }

    // Deklarative Lösung
    public static int wordScore(String word){
        return (int) word.chars()
                .filter(c -> c != 'a')
                .count();
    }

    public static void main(String[] args) {
        System.out.println(calculateScore("imperative"));
        System.out.println(calculateScore("no"));

        System.out.println(wordScore("declarative"));
        System.out.println(wordScore("yes"));
    }
}
