package dk.dma.ghanaweb.volta;

import java.util.Objects;

public class Waypoint {
    private final String id;
    private final String name;
    private final double[] coord;

    public Waypoint(String id, double[] coord) {
        this.id = id + System.nanoTime();
        this.name = id;
        this.coord = coord;
    }

    public double getX() {
        return coord[0];
    }

    public double getY() {
        return coord[1];
    }

    public String getName() {
        return name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Waypoint waypoint = (Waypoint) o;
        return Objects.equals(id, waypoint.id);
    }

    @Override
    public int hashCode() {

        return Objects.hash(id);
    }

    public double[] getLonLat() {
        return coord;
    }
}
