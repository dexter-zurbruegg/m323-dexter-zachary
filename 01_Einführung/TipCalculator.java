import java.util.List;

class TipCalculator { 

    public int getTipPercentage(List<String> names) {
        int tipPercentage;
        if(names.size() > 5) {
            tipPercentage = 20;
        } else if(names.size() > 0) {
            tipPercentage = 10;
        } else {
            tipPercentage = 0;
        }
        
        return tipPercentage;
    }
}

