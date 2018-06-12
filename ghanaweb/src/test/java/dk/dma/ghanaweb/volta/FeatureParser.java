package dk.dma.ghanaweb.volta;

public interface FeatureParser {
    void parse(String line);

    void parseTableLine(String line);

    boolean isFinished();

    default double parseDegreesMinuttesSeconds(String degMinSec) {
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
    }

    VoltaFeature getFeature();
}
