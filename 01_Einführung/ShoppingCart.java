import java.util.ArrayList;
import java.util.List;

public class ShoppingCart {

    private List<String> items = new ArrayList<>();
    private boolean bookAdded = false;

    public void addItem(String item) {
        items.add(item);
        if (item.equals("Buch")) {
            bookAdded = true;
        }
    }

    public void removeItem(String item) {
        items.remove(item);
        // absichtlich falsch: bookAdded wird nicht aktualisiert
    }

    public List<String> getItems() {
        return items;
    }

    public int getDiscountPercentage() {
        return bookAdded ? 5 : 0;
    }

    public static void main(String[] args) {
        ShoppingCart cart = new ShoppingCart();
        cart.addItem("Buch");

        System.out.println(cart.getDiscountPercentage()); // 5

        cart.removeItem("Buch");
        System.out.println(cart.getDiscountPercentage()); // immer noch 5 (Problem!)
    }
}
