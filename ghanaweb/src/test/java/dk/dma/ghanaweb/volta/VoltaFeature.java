package dk.dma.ghanaweb.volta;

import org.niord.model.geojson.FeatureCollectionVo;

public class VoltaFeature {
    private String heading;
    private FeatureCollectionVo featureCollectionVo;

    public VoltaFeature(String heading, FeatureCollectionVo featureCollectionVo) {

        this.heading = heading;
        this.featureCollectionVo = featureCollectionVo;
    }

    public String getHeading() {
        return heading;
    }

    public FeatureCollectionVo getFeatureCollectionVo() {
        return featureCollectionVo;
    }
}
