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
    private List<Waypoint> waypoints;

    VoltaFeatureParser(String heading) {
        this.heading = heading;
        this.features = new ArrayList<>();
        this.waypoints = new ArrayList<>();
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
        return line.contains("Table " + tableNumber);
    }

    void startParsingTable(String metadataLine) {
        isParsingTable = true;
        String[] tableData = metadataLine.split(" +");
        tableNumber = tableData[1];
        String tableType = tableData[2];
        if (tableType.contains("Characteristics")) {
            featureParser = new CharacteristicParser();
        } else if (tableType.contains("Buoys/Waypoints")) {
            featureParser = new WaypointParser(this);
        } else if (tableType.contains("Trees")) {
            featureParser = new TreeParser(waypoints);
        }
    }

    VoltaFeatureCollection getFeatureCollection() {
        return new VoltaFeatureCollection(heading, features);
    }

    void addWaypoint(Waypoint wp) {
        waypoints.add(wp);
    }
}
