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
import java.util.regex.Pattern;

public class TreeParser implements FeatureParser {
    private Pattern wpBetweenPattern = Pattern.compile("(?<from>WP\\s?[\\d-]{2,5}) .*and (?<to>WP\\s?[\\d-]{2,5})");

    private List<Waypoint> waypoints;
    private Waypoint cursor;
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

        if (line.contains("Between WP")) {
            Matcher m = wpBetweenPattern.matcher(line);
            if (m.find()) {
                String fromName = m.group("from").replace(" ", "");
                cursor = waypoints.stream().filter(wp -> wp.getName().equals(fromName)).findFirst().get();
            }
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
        double[] coord = getCoord(line).getLonLat();
        pointVo.setCoordinates(coord);
        feature.setGeometry(pointVo);
        HashMap<String, Object> properties = new HashMap<>();
        properties.put("characteristics", columns[0]);
        properties.put("area-size", columns[columns.length - 2]);
        properties.put("est-number-of-trees", columns[columns.length - 1]);
        feature.setProperties(properties);

        features.add(feature);
    }

    private void convertTreeGroup(List<String> treeGroupLines) {
        FeatureVo feature = new FeatureVo();
        LineStringVo lineStringVo = new LineStringVo();

        CalcRes coordOne = getCoord(treeGroupLines.get(1));
        CalcRes coordTwo = getCoord(treeGroupLines.get(2));

        List<double[]> coords = createCoords(coordOne, coordTwo);

        lineStringVo.setCoordinates(coords.toArray(new double[0][0]));
        feature.setGeometry(lineStringVo);

        String[] propSplit = treeGroupLines.get(1).split(";+");
        HashMap<String, Object> properties = new HashMap<>();
        properties.put("characteristics", treeGroupLines.get(0).split(";+")[0]);
        properties.put("area-size", propSplit[propSplit.length - 2]);
        properties.put("est-number-of-trees", propSplit[propSplit.length - 1]);
        feature.setProperties(properties);

        features.add(feature);
    }

    private List<double[]> createCoords(CalcRes coordOne, CalcRes coordTwo) {
        ArrayList<double[]> res = new ArrayList<>();

        res.add(coordOne.getLonLat());

        if (coordOne.wp1 == null) {
            res.add(coordTwo.getLonLat());
            return res;
        }

        Waypoint nextCandidate = null;
        for (Waypoint wp : waypoints) {
            if (nextCandidate == null) {
                if (coordOne.wp2.equals(wp)) {
                    nextCandidate = wp;
                    if (coordTwo.wp2.equals(wp)) { //coord two is in same segment
                        res.add(coordTwo.getLonLat());
                        break;
                    }
                } else if (coordTwo.wp2.equals(wp)) {
                    res.set(0, coordTwo.getLonLat());
                    nextCandidate = wp;
                    if (coordOne.wp2.equals(wp)) { //coord two is in same segment
                        res.add(coordOne.getLonLat());
                        break;
                    }
                }
            } else {
                if (coordTwo.wp2.equals(wp)) {
                    res.add(nextCandidate.getLonLat());
                    res.add(coordTwo.getLonLat());
                    break;
                } else if (coordOne.wp2.equals(wp)) {
                    res.add(nextCandidate.getLonLat());
                    res.add(coordOne.getLonLat());
                    break;
                } else {
                    res.add(nextCandidate.getLonLat());
                    nextCandidate = wp;
                }
            }
        }

        return res;
    }

    private CalcRes getCoord(String treeGroupLine) {
        CalcRes res = null;
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
            res = calculateLongitude(latitude);
        }

        if (!latFound) {
            res = calculateLatitude(longitude);
        }

        if (res == null) {
            res = new CalcRes(null, null).withLat(latitude).withLon(longitude);
        }

        return res;
    }

    private CalcRes calculateLongitude(double lat) {
        double lon = 0;
        Waypoint wp1 = null;
        Waypoint wp2 = null;

        List<Waypoint> wps = cursor != null ? waypoints.subList(waypoints.indexOf(cursor), waypoints.size()) : waypoints;

        for (int i = 0; i < wps.size() - 1; i++) {
            double x0 = wps.get(i).getX();
            double x1 = wps.get(i + 1).getX();
            double y0 = wps.get(i).getY();
            double y1 = wps.get(i + 1).getY();

            double a = (y1 - y0) / (x1 - x0);
            double b = y1 - a * x1;

            lon = (lat - b) / a;

            if (lon <= Math.max(x0, x1) && lon >= Math.min(x0, x1) && lat <= Math.max(y0, y1) && lat >= Math.min(y0, y1)) {
                wp1 = wps.get(i);
                wp2 = wps.get(i+1);
                break;
            }
        }
        return new CalcRes(wp1, wp2).withLat(lat).withLon(lon);
    }

    private CalcRes calculateLatitude(double lon) {
        double lat = 0;
        Waypoint wp1 = null;
        Waypoint wp2 = null;

        List<Waypoint> wps = cursor != null ? waypoints.subList(waypoints.indexOf(cursor), waypoints.size()) : waypoints;

        
        for (int i = 0; i < wps.size() - 1; i++) {
            double x0 = wps.get(i).getX();
            double x1 = wps.get(i + 1).getX();
            double y0 = wps.get(i).getY();
            double y1 = wps.get(i + 1).getY();

            double a = (y1 - y0) / (x1 - x0);
            double b = y1 - a * x1;

            lat = a * lon + b;

            if (lat <= Math.max(y0, y1) && lat >= Math.min(y0, y1) && lon <= Math.max(x0, x1) && lon >= Math.min(x0, x1)) {
                wp1 = wps.get(i);
                wp2 = wps.get(i+1);
                break;
            }
        }
        return new CalcRes(wp1, wp2).withLat(lat).withLon(lon);
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

        return new VoltaFeature(heading, "Tree", collection);
    }

    private class CalcRes {
        Waypoint wp1;
        Waypoint wp2;
        double lon;
        double lat;

        public CalcRes(Waypoint wp1, Waypoint wp2) {
            this.wp1 = wp1;
            this.wp2 = wp2;
        }

        public CalcRes withLat(double lat) {
            this.lat = lat;
            return this;
        }

        public CalcRes withLon(double lon) {
            this.lon = lon;
            return this;
        }

        public double[] getLonLat() {
            return new double[] {lon, lat};
        }
    }
}
