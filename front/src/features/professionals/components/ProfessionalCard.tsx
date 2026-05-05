import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { Profissional } from "../types/profissional";

type Props = {
    profissional: Profissional;
};

export function ProfessionalCard({ profissional }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{profissional.name}</Text>
      <Text style={styles.category}>{profissional.category}</Text>
      <Text style={styles.location}>{profissional.location}</Text>

      <View style={styles.row}>
        <Text style={styles.rating}>⭐ {profissional.rating}</Text>
        <Text style={styles.price}>{profissional.priceRange}</Text>
      </View>

      <View style={styles.tagsContainer}>
        {profissional.tags.map((tag) => (
          <Text key={tag} style={styles.tag}>
            {tag}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  name: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  category: {
    color: "#c7d2fe",
    marginTop: 4,
  },
  location: {
    color: "#cbd5e1",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  rating: {
    color: "#facc15",
  },
  price: {
    color: "#ffffff",
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  tag: {
    backgroundColor: "rgba(167,139,250,0.2)",
    color: "#d8b4fe",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    marginRight: 8,
    marginBottom: 8,
  },
});