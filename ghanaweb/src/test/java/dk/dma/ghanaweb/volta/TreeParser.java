package dk.dma.ghanaweb.volta;

import org.niord.model.geojson.FeatureCollectionVo;
import org.niord.model.geojson.FeatureVo;
import org.niord.model.geojson.LineStringVo;
import org.niord.model.geojson.PointVo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Stack;
import java.util.regex.Matcher;

public class TreeParser implements FeatureParser {
    private List<Waypoint> waypoints;
    private boolean isFinished;
    private String heading;

    private List<FeatureVo> features;
    private Stack<List<String>> treeGroup;


    private TreeParser() {
        features = new ArrayList<>();
        treeGroup = new Stack<>();
    }

    TreeParser(List<Waypoint> waypoints) {
        this();
        this.waypoints = waypoints;
    }

    @Override
    public void parse(String line) {
        if (line.startsWith("Source:")) {
            isFinished = true;
        }

        if (isTreeLine(line)) {
            convertTree(line);
        }
    }

    private void convertTree(String line) {
        String[] columns = line.split(";+");
        if (columns.length == 1 && treeGroup.empty()) {
            ArrayList<String> group = new ArrayList<>();
            group.add(line);
            treeGroup.push(group);
            return;
        }

        if ((line.startsWith("between") || line.startsWith("Between")) && !line.contains("WP") && !treeGroup.empty()) {
            treeGroup.peek().add(line);
            return;
        }

        if (line.startsWith("and") && !treeGroup.empty()) {
            treeGroup.peek().add(line);
            convertTreeGroup(treeGroup.pop());
            return;
        }


        FeatureVo feature = new FeatureVo();
        PointVo pointVo = new PointVo();
//        double[] coord = {parseDegreesMinuttesSeconds(columns[2]), parseDegreesMinuttesSeconds(columns[1])};
        double[] coord = getCoord(line);
        pointVo.setCoordinates(coord);
        feature.setGeometry(pointVo);
        HashMap<String, Object> properties = new HashMap<>();
        properties.put("characteristics", columns[0]);
        properties.put("area-size", columns[columns.length -2]);
        properties.put("est-number-of-trees", columns[columns.length - 1]);
        feature.setProperties(properties);

        features.add(feature);
    }

    private void convertTreeGroup(List<String> treeGroupLines) {
        FeatureVo feature = new FeatureVo();
        LineStringVo lineStringVo = new LineStringVo();

        double[] coordOne = getCoord(treeGroupLines.get(1));
        double[] coordTwo = getCoord(treeGroupLines.get(2));

        double[][] coords = {coordOne, coordTwo};
        lineStringVo.setCoordinates(coords);
        feature.setGeometry(lineStringVo);

        String[] propSplit = treeGroupLines.get(1).split(";+");
        HashMap<String, Object> properties = new HashMap<>();
        properties.put("characteristics", treeGroupLines.get(0).split(";+")[0]);
        properties.put("area-size", propSplit[propSplit.length - 2]);
        properties.put("est-number-of-trees", propSplit[propSplit.length - 1]);
        feature.setProperties(properties);

        features.add(feature);
    }

    private double[] getCoord(String treeGroupLine) {
        double latitude = 0;
        double longitude = 0;

        boolean latFound = false;
        boolean lonFound = false;

        Matcher latMatcher = latPattern.matcher(treeGroupLine);
        if (latMatcher.find()) {
            latitude = parseDegreesMinuttesSeconds(latMatcher.group("lat"));
            latFound = true;
        }
        Matcher lonMatcher = lonPattern.matcher(treeGroupLine);
        if (lonMatcher.find()) {
            longitude = parseDegreesMinuttesSeconds(lonMatcher.group("lon"));
            lonFound = true;
        }

        if (!lonFound) {
            longitude = calculateLongitude(latitude);
        }

        if (!latFound) {
            latitude =calculateLatitude(longitude);
        }

        return new double[] {longitude, latitude};
    }

    private double calculateLongitude(double lat) {
        double lon = 0;
        for (int i = 0; i < waypoints.size() - 1; i++) {
            double x0 = waypoints.get(i).getX();
            double x1 = waypoints.get(i+1).getX();
            double y0 = waypoints.get(i).getY();
            double y1 = waypoints.get(i+1).getY();

            double a = (y1-y0)/(x1-x0);
            double b = y1 - a * x1;

            lon = (lat - b) / a;

            if (lon < Math.max(x0, x1) && lon > Math.min(x0, x1)) {
                break;
            }
        }
        return lon;
    }

    private double calculateLatitude(double lon) {
        double lat = 0;
        for (int i = 0; i < waypoints.size() - 1; i++) {
            double x0 = waypoints.get(i).getX();
            double x1 = waypoints.get(i+1).getX();
            double y0 = waypoints.get(i).getY();
            double y1 = waypoints.get(i+1).getY();

            double a = (y1-y0)/(x1-x0);
            double b = y1 - a * x1;

            lat = a*lon + b;

            if (lat < Math.max(y0, y1) && lat > Math.min(y0, y1)) {
                break;
            }
        }
        return lat;
    }

    private boolean isTreeLine(String line) {
        return line.startsWith("Grove") || line.startsWith("Single") || (line.startsWith("Between") && !line.contains("WP")) || line.startsWith("between") || line.startsWith("and");
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
