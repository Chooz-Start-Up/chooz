import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chooz</Text>
      <Text style={styles.subtitle}>Nearby Restaurants</Text>
      <Text style={styles.placeholder}>Scaffold working</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#D11D27",
  },
  subtitle: {
    fontSize: 18,
    color: "#343434",
    marginTop: 8,
  },
  placeholder: {
    fontSize: 14,
    color: "#888",
    marginTop: 16,
  },
});
