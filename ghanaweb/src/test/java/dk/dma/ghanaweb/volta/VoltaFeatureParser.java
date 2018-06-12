package dk.dma.ghanaweb.volta;

import java.util.ArrayList;
import java.util.List;

class VoltaFeatureParser {

    private final String heading;
    private boolean isParsingTable;
    private String tableNumber;
    private boolean tableFound;
    private FeatureParser featureParser;
    private List<VoltaFeature> features;

    VoltaFeatureParser(String heading) {
        this.heading = heading;
        this.features = new ArrayList<>();
    }

    boolean isParsingTable() {
        return isParsingTable;
    }

    void parseLine(String line) {
        if (tableFound) {
            featureParser.parse(line);
            if (featureParser.isFinished()) {
                tableFound = false;
                isParsingTable = false;
                features.add(featureParser.getFeature());
            }
        } else if (isTableLine(line)) {
            tableFound = true;
            featureParser.parseTableLine(line);
        }
    }

    private boolean isTableLine(String line) {
        return line.contains("Table") && line.contains(tableNumber);
    }

    void startParsingTable(String metadataLine) {
        isParsingTable = true;
        String[] tableData = metadataLine.split(" +");
        tableNumber = tableData[1];
        String tableType = tableData[2];
        if (tableType.contains("Characteristics")) {
            featureParser = new CharacteristicParser();
        }
    }

    VoltaFeatureCollection getFeatureCollection() {
        return new VoltaFeatureCollection(heading, features);
    }
}
