package dk.dma.ghanaweb.volta;

import java.util.regex.Pattern;

public interface FeatureParser {
    Pattern latPattern = Pattern.compile("(?<lat>\\d°\\d{2}’\\d{2}([.,]\\d{2})?”N)");
    Pattern lonPattern = Pattern.compile("(?<lon>\\d°\\d{2}’\\d{2}([.,]\\d{2})?”[WE])");

    void parse(String line);

    void parseTableLine(String line);

    boolean isFinished();

    default double parseDegreesMinuttesSeconds(String degMinSec) {
        try {
            degMinSec = degMinSec.replace("*", "’");
            String[] degreeSplit = degMinSec.split("°");
            int degrees = Integer.parseInt(degreeSplit[0]);
            String[] minSplit = degreeSplit[1].split("’");
            int minutes = Integer.parseInt(minSplit[0]);
            String[] secSplit = minSplit[1].split("”");
            double seconds = Double.parseDouble(secSplit[0]);

            String nsew = secSplit[1];
            int sign = nsew.equals("W") || nsew.equals("S") ? -1 : 1;
            return sign * (degrees + minutes/60D + seconds/3600D);
        } catch (NumberFormatException e) {
            System.out.println(degMinSec);
            throw e;
        }
    }

    VoltaFeature getFeature();
}
