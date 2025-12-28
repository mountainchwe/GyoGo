import { BlurView } from "expo-blur";
import { Image, Platform, StyleSheet, Text, View } from "react-native";

type PolaroidProps = {
  image: { uri: string };
  name: string;
  desc: string;
  filter?: "none" | "blur" | "watermark";
  watermarkName?: string;
};

export default function Polaroid({ image, name, desc, filter, watermarkName }: PolaroidProps) {
  return (
    <View style={styles.polaroidContainer}>
      {/* IMAGE AREA (frame) */}
      <View style={styles.frame}>
        <Image source={image} style={styles.image} resizeMode="cover" />

        {/* BLUR FILTER */}
        {filter === "blur" && (
          <View style={styles.overlayContainer} pointerEvents="none">
            <BlurView
              intensity={Platform.OS === "web" ? 40 : 100}
              tint="light"
              style={styles.blurOverlay}
            />
            {/* Extra blur overlays for mobile version */}
            {Platform.OS !== "web" && (
            <>
              <View style={styles.fogOverlay} />
              <View style={styles.frostedFogOverlay} />
            </>
          )}
          </View>
        )}

        {/* WATERMARK FILTER */}
        {filter === "watermark" && (
          <View style={styles.watermarkOverlay} pointerEvents="none">
            {Array.from({ length: 160 }).map((_, i) => (
              <Text key={i} style={styles.watermarkText}>
                {watermarkName ?? "username"}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* CAPTION BELOW IMAGE */}
      <View style={styles.caption}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  polaroidContainer: {
    width: 250,
    backgroundColor: "#ffffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
    pointerEvents: "box-none",
  },

  frame: {
    width: "100%",
    height: 300,              // IMPORTANT: lock image height
    position: "relative",
    overflow: "hidden",       // contains blur inside image area
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  // Captions
  caption: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  desc: {
    fontSize: 13,
    textAlign: "center",
    color: "#777",
  },

  /* --- BLUR OVERLAY (image only) --- */
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  fogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(231, 231, 231, 0.35)",
  },

  frostedFogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },

  /* --- WATERMARK OVERLAY --- */
  watermarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    flexDirection: "row",
    opacity: 0.5,
  },
  watermarkText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    margin: 4,
    transform: [{ rotate: "-15deg" }],
  },

});
