package dk.dma.ghanaweb.volta;

import org.niord.model.geojson.FeatureCollectionVo;

public class VoltaFeature {
    private String heading;
    private String type;
    private FeatureCollectionVo featureCollectionVo;

    public VoltaFeature(String heading, String type, FeatureCollectionVo featureCollectionVo) {

        this.heading = heading;
        this.type = type;
        this.featureCollectionVo = featureCollectionVo;
    }

    public String getType() {
        return type;
    }

    public String getHeading() {
        return heading;
    }

    public FeatureCollectionVo getFeatureCollectionVo() {
        return featureCollectionVo;
    }
}
