package dk.dma.ghanaweb.volta;

import org.niord.model.geojson.FeatureCollectionVo;

public class VoltaFeature {
    private String heading;
    private String type;
    private String displayType;
    private FeatureCollectionVo featureCollectionVo;

    public VoltaFeature(String heading, String type, String displayType, FeatureCollectionVo featureCollectionVo) {

        this.heading = heading;
        this.type = type;
        this.displayType = displayType;
        this.featureCollectionVo = featureCollectionVo;
    }

    public String getType() {
        return type;
    }

    public String getDisplayType() {
        return displayType;
    }

    public String getHeading() {
        return heading;
    }

    public FeatureCollectionVo getFeatureCollectionVo() {
        return featureCollectionVo;
    }
}
