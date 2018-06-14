package dk.dma.ghanaweb.volta;

public class Waypoint {
    private final double[] coord;

    public Waypoint(double[] coord) {
        this.coord = coord;
    }

    public double getX() {
        return coord[0];
    }

    public double getY() {
        return coord[1];
    }
}
