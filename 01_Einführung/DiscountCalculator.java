import java.util.ArrayList;
import java.util.List;

public class DiscountCalculator {

    public static int getDiscountPercentage(List<String> cart) {
        return cart.contains("Buch") ? 5 : 0;
    }

    public static void main(String[] args) {
        List<String> cart = new ArrayList<>();
        cart.add("Buch");

        System.out.println(getDiscountPercentage(cart)); // 5

        cart.remove("Buch");
        System.out.println(getDiscountPercentage(cart)); // 0 (korrekt)
    }
}
