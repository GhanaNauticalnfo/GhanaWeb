package dk.dma.ghanaweb.volta;

import org.niord.model.geojson.FeatureCollectionVo;
import org.niord.model.geojson.FeatureVo;
import org.niord.model.geojson.PointVo;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;

public class CharacteristicParser implements FeatureParser {
    private Map<String, List<String>> characteristic;
    private String lastLocationKey;
    private boolean isFinished;
    private String heading;

    CharacteristicParser() {
        characteristic = new HashMap<>();
    }

    @Override
    public void parse(String line) {
        if (line.startsWith("Source:")) {
            isFinished = true;
        }

        readCharacteristics(line);
    }

    private void readCharacteristics(String line) {
        if (line.startsWith("Location") || line.startsWith("Starting Point") || line.startsWith("End Point") || line.startsWith("Alternative End Point")) {
            String[] locationLineSplit = line.split(";");
            lastLocationKey = locationLineSplit[0];
            List<String> latLon = new ArrayList<>();
            latLon.add(locationLineSplit[1].replace("Latitude - ", "").replace(",", "."));
            characteristic.put(lastLocationKey, latLon);
        }

        if (line.contains("Longitude")) {
            Matcher matcher = lonPattern.matcher(line);
            if (matcher.find()) {
                characteristic.get(lastLocationKey).add(matcher.group("lon").replace(",", "."));
            } else {
                System.out.println("WHAT???");
                System.out.println(line);
            }
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

        if (line.startsWith("Cost for buoyage [USD]") || line.startsWith("Costs for buoyage [USD]")) {
            characteristic.put("Cost for buoyage [USD]", Collections.singletonList(line.split(";")[1]));
            isFinished = true;
        }

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
        String type = "Characteristics";
        if (heading.contains("Fairway")) {
            type = "Fairway Characteristics";
        }
        return new VoltaFeature(heading, type, type, convertCharacteristic());
    }

    private FeatureCollectionVo convertCharacteristic() {
        List<FeatureVo> features = new ArrayList<>();
        characteristic.keySet().forEach(key -> {
            if (key.startsWith("Location")) {
                features.add(createFeature(key, "Location"));
            } else if (key.startsWith("Starting Point")) {
                features.add(createFeature(key, "Starting Point"));
            } else if (key.startsWith("End Point")) {
                features.add(createFeature(key, "End Point"));
            } else if (key.startsWith("Alternative End Point")) {
                features.add(createFeature(key, "Alternative End Point"));
            }
        });

        FeatureCollectionVo featureCollection = new FeatureCollectionVo();
        featureCollection.setFeatures(features.toArray(new FeatureVo[0]));

        return featureCollection;
    }

    private FeatureVo createFeature(String locKey, String locationIdentifier) {
        FeatureVo feature = new FeatureVo();
        PointVo pointVo = new PointVo();
        List<String> latLon = characteristic.get(locKey);
        double[] coord = {parseDegreesMinuttesSeconds(latLon.get(1)), parseDegreesMinuttesSeconds(latLon.get(0))};
        pointVo.setCoordinates(coord);
        feature.setGeometry(pointVo);

        HashMap<String, Object> properties = new HashMap<>();
        characteristic.forEach((key, value) -> properties.put(key, String.join(" - ", value)));
        properties.put("LocationIdentifier", locationIdentifier);
        feature.setProperties(properties);

        return feature;
    }
}
