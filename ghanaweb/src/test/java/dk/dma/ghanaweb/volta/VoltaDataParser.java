package dk.dma.ghanaweb.volta;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Before;
import org.junit.Test;
import org.niord.model.geojson.FeatureCollectionVo;
import org.niord.model.geojson.FeatureVo;
import org.niord.model.geojson.LineStringVo;
import org.niord.model.geojson.PointVo;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Stack;

public class VoltaDataParser {
    private List<FeatureVo> features;
    private Stack<List<String>> treeGroup;
    private Map<String, List<String>> characteristic;
    private Deque<String> metadata;
    private List<VoltaFeatureCollection> voltaFeatures;
    private VoltaFeatureParser currentFeatureParser;

    @Before
    public void setUp() {
        features = new ArrayList<>();
        treeGroup = new Stack<>();
        characteristic = new HashMap<>();
        metadata = new ArrayDeque<>();
        voltaFeatures = new ArrayList<>();
    }

    @Test
    public void convertAll() throws IOException, URISyntaxException {
        String outputFileName = "lake-volta-data.json";
        Files.deleteIfExists(Paths.get("target", outputFileName));

        Path path = Paths.get(VoltaDataParser.class.getResource("/Draft Survey Report Metadata.txt").toURI());
        Files.lines(path, Charset.forName("UTF-8")).forEach(metadata::offerLast);

        path = Paths.get(VoltaDataParser.class.getResource("/Draft Survey Report.csv").toURI());
        Files.lines(path, Charset.forName("UTF-8")).forEach(this::readNext);

        ObjectMapper objectMapper = new ObjectMapper();

        Path outputFile = Files.createFile(Paths.get("target", outputFileName));

        Files.write(outputFile, objectMapper.writeValueAsString(voltaFeatures).getBytes("UTF-8"));
    }

    private void readNext(String line) {
        if (currentFeatureParser == null) {
            String metadataLine = metadata.pollFirst();
            currentFeatureParser = new VoltaFeatureParser(metadataLine);
        }

        if (currentFeatureParser.isParsingTable()) {
            currentFeatureParser.parseLine(line);
        } else {
            String metadataLine = metadata.pollFirst();
            if (metadataLine == null) {
                return;
            }
            if (metadataLine.contains("Table")) {
                currentFeatureParser.startParsingTable(metadataLine);
            } else {
                voltaFeatures.add(currentFeatureParser.getFeatureCollection());
                currentFeatureParser = new VoltaFeatureParser(metadataLine);
            }
        }
    }

    @Test
    public void convertCharacteristics() throws IOException, URISyntaxException {
        String outputFileName = "landing-site-sedom.json";
        Files.deleteIfExists(Paths.get("target", outputFileName));

        Path path = Paths.get(VoltaDataParser.class.getResource("/landing-site-sedom.csv").toURI());
        Files.lines(path, Charset.forName("UTF-8")).forEach(this::readCharacteristics);

        convertCharacteristic();

        FeatureCollectionVo featureCollection = new FeatureCollectionVo();
        featureCollection.setFeatures(features.toArray(new FeatureVo[0]));

        Path outputFile = Files.createFile(Paths.get("target", outputFileName));

        Files.write(outputFile, featureCollection.toString().getBytes("UTF-8"));
    }

    private void readCharacteristics(String line) {
        if (line.startsWith("Location")) {
            List<String> latLon = new ArrayList<>();
            latLon.add(line.split(";")[1].replace("Latitude - ", "").replace(",", "."));
            characteristic.put("Location", latLon);
        }

        if (line.contains("Longitude")) {
            characteristic.get("Location").add(line.split(";")[1].replace("Longitude - ", "").replace(",", "."));
        }

        if (line.startsWith("Type of waterborne transport")) {
            characteristic.put("Type of waterborne transport", Collections.singletonList(line.split(";")[1]));
        }

        if (line.startsWith("Total population served by")) {
            characteristic.put("Total population served by location", Collections.singletonList(line.split(";")[1]));
        }

        if (line.startsWith("Number of visiting outboarder")) {
            characteristic.put("Number of visiting outboarder boats", Collections.singletonList(line.split(";")[1]));
        }

        if (line.startsWith("Weekly passenger transport by")) {
            characteristic.put("Weekly passenger transport by boat", Collections.singletonList(line.split(";")[1]));
        }

        if (line.startsWith("Design width of approach")) {
            characteristic.put("Design width of approach channel", Collections.singletonList(line.split(";")[1]));
        }

        if (line.startsWith("Appr. clearance width for")) {
            characteristic.put("Appr. clearance width for approach channel", Collections.singletonList(line.split(";")[1]));
        }

        if (line.startsWith("Cutting of trees required")) {
            characteristic.put("Cutting of trees required", Collections.singletonList(line.split(";")[1]));
        }

        if (line.startsWith("Appr. area to be cleared from")) {
            characteristic.put("Appr. area to be cleared from submerged trees", Collections.singletonList(line.split(";")[1]));
        }

        if (line.startsWith("Estimated number of trees to be")) {
            characteristic.put("Estimated number of trees to be cut Ø< 0.1 m /Ø > 0.1 m", Collections.singletonList(line.split(";")[1]));
        }

        if (line.startsWith("Costs for cutting of trees [USD")) {
            characteristic.put("Costs for cutting of trees [USD]", Collections.singletonList(line.split(";")[1]));
        }

        if (line.startsWith("Navigational Aids")) {
            characteristic.put("Navigational Aids", Collections.singletonList(line.split(";")[1]));
        }

        if (line.startsWith("Number of buoys")) {
            characteristic.put("Number of buoys", Collections.singletonList(line.split(";")[1]));
        }

        if (line.startsWith("Cost for buoyage [USD]")) {
            characteristic.put("Cost for buoyage [USD]", Collections.singletonList(line.split(";")[1]));
        }

    }

    private void convertCharacteristic() {
        FeatureVo feature = new FeatureVo();
        PointVo pointVo = new PointVo();
        List<String> latLon = characteristic.get("Location");
        double[] coord = {parseDegreesMinuttesSeconds(latLon.get(1)), parseDegreesMinuttesSeconds(latLon.get(0))};
        pointVo.setCoordinates(coord);
        feature.setGeometry(pointVo);

        HashMap<String, Object> properties = new HashMap<>();

        characteristic.forEach((key, value) -> properties.put(key, String.join(" - ", value)));

        feature.setProperties(properties);

        features.add(feature);

    }

    @Test
    public void convertTrees() throws IOException, URISyntaxException {
        String outputFileName = "trees-north-south-route.json";
        Files.deleteIfExists(Paths.get("target", outputFileName));
        Path path = Paths.get(VoltaDataParser.class.getResource("/trees-north-south-route.csv").toURI());
        Files.lines(path, Charset.forName("UTF-8")).forEach(this::convertTree);

        FeatureCollectionVo featureCollection = new FeatureCollectionVo();
        featureCollection.setFeatures(features.toArray(new FeatureVo[0]));

        Path outputFile = Files.createFile(Paths.get("target", outputFileName));

        Files.write(outputFile, featureCollection.toString().getBytes("UTF-8"));
    }

    private void convertTree(String line) {
        System.out.println(line);
        if (!isTreeLine(line)) {
            return;
        }

        String[] columns = line.split(";");
        if (columns.length == 1 && treeGroup.empty()) {
            ArrayList<String> group = new ArrayList<>();
            group.add(line);
            treeGroup.push(group);
            return;
        }

        if (line.startsWith("between") && !treeGroup.empty()) {
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
        double[] coord = {parseDegreesMinuttesSeconds(columns[2]), parseDegreesMinuttesSeconds(columns[1])};
        pointVo.setCoordinates(coord);
        feature.setGeometry(pointVo);
        HashMap<String, Object> properties = new HashMap<>();
        properties.put("characteristics", columns[0]);
        properties.put("area-size", columns[3]);
        properties.put("est-number-of-trees", columns[4]);
        feature.setProperties(properties);

        features.add(feature);
    }

    private void convertTreeGroup(List<String> treeGroupLines) {
        FeatureVo feature = new FeatureVo();
        LineStringVo lineStringVo = new LineStringVo();

        String[] line2Split = treeGroupLines.get(1).split(";");
        String[] line3Split = treeGroupLines.get(2).split(";");
        double[] coordOne = {parseDegreesMinuttesSeconds(line2Split[2]), parseDegreesMinuttesSeconds(line2Split[1])};
        double[] coordTwo = {parseDegreesMinuttesSeconds(line3Split[2]), parseDegreesMinuttesSeconds(line3Split[1])};
        double[][] coords = {coordOne, coordTwo};
        lineStringVo.setCoordinates(coords);
        feature.setGeometry(lineStringVo);

        HashMap<String, Object> properties = new HashMap<>();
        properties.put("characteristics", treeGroupLines.get(0).split(";")[0]);
        properties.put("area-size", line2Split[3]);
        properties.put("est-number-of-trees", line2Split[3]);
        feature.setProperties(properties);

        features.add(feature);
    }

    private boolean isTreeLine(String line) {
        return line.startsWith("Grove") || line.startsWith("Single") || line.startsWith("between") || line.startsWith("and");
    }

    @Test
    public void convertWaypoints() throws URISyntaxException, IOException {
        Path path = Paths.get(VoltaDataParser.class.getResource("/waypoint-north-south-route.csv").toURI());
        Files.lines(path, Charset.forName("UTF-8")).forEach(this::convertWaypoint);

        features = new ArrayList<>();
        FeatureCollectionVo waypointsVLTCMainNorthSouth = new FeatureCollectionVo();
        waypointsVLTCMainNorthSouth.setFeatures(features.toArray(new FeatureVo[0]));

        Path outputFile = Files.createFile(Paths.get("target", "waypoint-north-south-route.json"));

        Files.write(outputFile, waypointsVLTCMainNorthSouth.toString().getBytes("UTF-8"));


    }

    private void convertWaypoint(String line) {
        System.out.println(line);
        if (line.startsWith("Waypoint")) {
            return;
        }

        String[] waypointTokens = line.split(";");
        String name = waypointTokens[0];

        FeatureVo feature = new FeatureVo();
        PointVo pointVo = new PointVo();
        double[] coord = {parseDegreesMinuttesSeconds(waypointTokens[2]), parseDegreesMinuttesSeconds(waypointTokens[1])};
        pointVo.setCoordinates(coord);
        feature.setGeometry(pointVo);
        HashMap<String, Object> properties = new HashMap<>();
        properties.put("name", name);
        feature.setProperties(properties);
        features.add(feature);
    }

    private double parseDegreesMinuttesSeconds(String degMinSec) {
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

    @Test
    public void name() {
        String charac = "Table  8 Characteristics";
        String bu = "Table  9 Buoys/Waypoints";
        String tree = "Table 10 Trees";

        System.out.println("\""+charac.replace("  ", " ").split(" ")[1] + "\"");
        System.out.println("\""+charac.split(" +")[1] + "\"");

    }
}
