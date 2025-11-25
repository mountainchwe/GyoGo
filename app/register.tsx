import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../firebaseConfig";

export default function Register() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // create user profile in Firestore
      await setDoc(doc(db, "users", uid), {
        username,
        email,
        createdAt: Date.now(),
      });

      alert("Account created!");
      router.replace("/login");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        placeholderTextColor={"#000000"}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        placeholderTextColor={"#000000"}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        placeholderTextColor={"#000000"}
        onChangeText={setPassword}
      />

      <TouchableOpacity onPress={handleRegister} style={styles.button}>
        <Text style={{ color: "white", fontWeight: "600" }}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={{ marginTop: 12 }}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#FFFFFF" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 30, textAlign: "center" },
  input: {
    borderWidth: 1, borderColor: "#ccc", marginBottom: 12,
    padding: 12, borderRadius: 6,
  },
  button: {
    backgroundColor: "#B48CF0",
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
});
