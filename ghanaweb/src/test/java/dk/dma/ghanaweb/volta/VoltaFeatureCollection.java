package dk.dma.ghanaweb.volta;

import java.util.List;

public class VoltaFeatureCollection {
    private String heading;
    private List<VoltaFeature> features;

    public VoltaFeatureCollection(String heading, List<VoltaFeature> features) {
        this.heading = heading;
        this.features = features;
    }
}
