package dk.dma.ghanaweb.volta;

import org.niord.model.geojson.FeatureCollectionVo;
import org.niord.model.geojson.FeatureVo;
import org.niord.model.geojson.LineStringVo;
import org.niord.model.geojson.PointVo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class WaypointParser implements FeatureParser {
    private VoltaFeatureParser voltaFeatureParser;
    private boolean isFinished;
    private String heading;
    private List<double[]> fairwayCoords;
    private List<String> fairwayCoordsString;

    private List<FeatureVo> features;

    private WaypointParser() {
        this.features = new ArrayList<>();
        this.fairwayCoords = new ArrayList<>();
        this.fairwayCoordsString = new ArrayList<>();
    }

    WaypointParser(VoltaFeatureParser voltaFeatureParser) {
        this();
        this.voltaFeatureParser = voltaFeatureParser;

    }

    @Override
    public void parse(String line) {
        if (line.startsWith("Source:")) {
            isFinished = true;
        }

        if (line.startsWith("WP")) {
            convertWaypoint(line);
        }
    }

    private void convertWaypoint(String line) {
        String[] waypointTokens = line.split(";+");
        String name = waypointTokens[0];

        FeatureVo feature = new FeatureVo();
        PointVo pointVo = new PointVo();
        double[] coord = {parseDegreesMinuttesSeconds(waypointTokens[2]), parseDegreesMinuttesSeconds(waypointTokens[1])};
        voltaFeatureParser.addWaypoint(new Waypoint(name, coord));
        fairwayCoords.add(coord);
        fairwayCoordsString.add(waypointTokens[1] + " - " + waypointTokens[2]);
        pointVo.setCoordinates(coord);
        feature.setGeometry(pointVo);
        HashMap<String, Object> properties = new HashMap<>();
        properties.put("name", name);
        properties.put("location", waypointTokens[1] + " - " + waypointTokens[2]);
        feature.setProperties(properties);
        features.add(feature);

    }

    @Override
    public void parseTableLine(String line) {
        heading = "Proposed " + line.split(";")[1];
    }

    @Override
    public boolean isFinished() {
        return isFinished;
    }

    @Override
    public VoltaFeature getFeature() {
        FeatureCollectionVo collection = new FeatureCollectionVo();
        FeatureVo fairWayFeature = new FeatureVo();
        LineStringVo fairwayLine = new LineStringVo();
        fairwayLine.setCoordinates(fairwayCoords.toArray(new double[0][0]));
        HashMap<String, Object> properties = new HashMap<>();
        properties.put("name", heading);
        properties.put("waypointType", "waypointConnector");
        properties.put("locationStart", fairwayCoordsString.get(0));
        properties.put("locationEnd", fairwayCoordsString.get(fairwayCoordsString.size() - 1));
        fairWayFeature.setProperties(properties);
        fairWayFeature.setGeometry(fairwayLine);
        features.add(fairWayFeature);
        collection.setFeatures(features.toArray(new FeatureVo[0]));

        return new VoltaFeature(heading, "Waypoint", "Proposed waypoint (2018)", collection);
    }
}
