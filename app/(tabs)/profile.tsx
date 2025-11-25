import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../../firebaseConfig";

export default function Profile() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth); //logs user out completely
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      {/* Section title (optional) */}
      {/* <Text style={styles.sectionTitle}>Profile</Text> */}

      <TouchableOpacity style={styles.row} onPress={() => router.push("/myUploads")}>
        <Text style={styles.rowText}>My Polaroids</Text>
      </TouchableOpacity>
      <View style={styles.divider} />

      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowText}>My Likes</Text>
      </TouchableOpacity>
      <View style={styles.divider} />

      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowText}>My Bookmarks</Text>
      </TouchableOpacity>
      <View style={styles.divider} />

      <TouchableOpacity style={styles.row}>
        <Text style={styles.rowText}>Edit Profile</Text>
      </TouchableOpacity>
      <View style={styles.divider} />

      {/* Log out button (last row) */}
      <TouchableOpacity style={styles.row} onPress={handleLogout}>
        <Text style={[styles.rowText, { color: "red" }]}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },

  row: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },

  rowText: {
    fontSize: 16,
    color: "#333",
  },

  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "#ddd",
    opacity: 0.6,
  },
});
