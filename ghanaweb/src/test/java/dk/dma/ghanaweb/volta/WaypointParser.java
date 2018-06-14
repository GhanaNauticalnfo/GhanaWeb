package dk.dma.ghanaweb.volta;

import org.niord.model.geojson.FeatureCollectionVo;
import org.niord.model.geojson.FeatureVo;
import org.niord.model.geojson.PointVo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class WaypointParser implements FeatureParser {
    private VoltaFeatureParser voltaFeatureParser;
    private boolean isFinished;
    private String heading;

    private List<FeatureVo> features;

    private WaypointParser() {
        features = new ArrayList<>();
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
        voltaFeatureParser.addWaypoint(new Waypoint(coord));
        pointVo.setCoordinates(coord);
        feature.setGeometry(pointVo);
        HashMap<String, Object> properties = new HashMap<>();
        properties.put("name", name);
        feature.setProperties(properties);
        features.add(feature);

    }

    @Override
    public void parseTableLine(String line) {
        heading = line.split(";")[1];
    }

    @Override
    public boolean isFinished() {
        return isFinished;
    }

    @Override
    public VoltaFeature getFeature() {
        FeatureCollectionVo collection = new FeatureCollectionVo();
        collection.setFeatures(features.toArray(new FeatureVo[0]));

        return new VoltaFeature(heading, collection);
    }
}
