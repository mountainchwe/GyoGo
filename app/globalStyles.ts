import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({

    //DISCOVER
    container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  swiperContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  cardWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonRow: {
    position: "absolute",   // ← REQUIRED
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    bottom: 60,
    zIndex: 50, // ensure above swiper
  },
  circleBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#B48CF0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  imageWrapper: {
	width: "100%",
	height: "80%",
	borderRadius: 15,
	overflow: "hidden",
  },
  cardImage: {
	width: "50%",
	height: "50%",
  },

  //addPolaroid
  uploadContainer: { flex: 1, padding: 20, backgroundColor: "#fff" },
  heading: { fontSize: 22, fontWeight: "600", marginBottom: 20 },
  imageBox: {
    width: "100%", height: 200, borderRadius: 8, backgroundColor: "#f0f0f0",
    justifyContent: "center", alignItems: "center", marginBottom: 15,
  },
  image: { width: "100%", height: "100%", borderRadius: 8 },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 6,
    padding: 10, marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: "#B48CF0", padding: 14, alignItems: "center",
    borderRadius: 8, marginTop: 10,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(113, 111, 111, 0.2)",
    zIndex: 2,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
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

  watermarkContainer: {
  position: "absolute",
  top: -150,
  left: 0,
  right: 0,
  bottom: 0,
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  opacity: 0.5,        // transparency
  transform: [{ rotate: "-25deg" }],
},

watermarkText: {
  fontSize: 20,
  color: "#000",
  margin: 10,
},

  filterRow: {
  flexDirection: "row",
  justifyContent: "center",
  marginVertical: 10,
},

filterButton: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderWidth: 1,
  borderColor: "#B48CF0",
  borderRadius: 6,
  marginHorizontal: 6,
},

filterButtonActive: {
  backgroundColor: "#B48CF0",
},

filterText: {
  color: "#B48CF0",
  fontSize: 14,
  textTransform: "capitalize",
},

filterTextActive: {
  color: "#fff",
},

})