package dk.dma.ghanaweb.volta;

import org.niord.model.geojson.FeatureCollectionVo;

public class VoltaFeature {
    private final String heading;
    private final FeatureCollectionVo featureCollectionVo;

    public VoltaFeature(String heading, FeatureCollectionVo featureCollectionVo) {

        this.heading = heading;
        this.featureCollectionVo = featureCollectionVo;
    }
}
