import { StyleSheet, Dimensions, Platform } from "react-native";

// #region main
export default mainStyles = StyleSheet.create({
    mainContainer: {
        width: "100%",
        height: "100%",
        // backgroundColor: "#",
    },
    center: {
        justifyContent: "center",
        alignItems: "center",
        // alignContent: "center",
        // alignSelf: "center",
    },
});

// #region login
export const loginStyles = StyleSheet.create({
    mainContainer: {
        backgroundColor: "transparent",
        width: "100%",
        height: "100%",
        // width: Dimensions.get("window").width,
        // height: Dimensions.get("window").height,
    },
    background: {
        width: "100%",
        height: "100%",
        position: "absolute",
        // backgroundColor: "#004439",
    },
    lights: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        position: "absolute",
        top: -10,
    },
    light1: {
        height: 255,
        width: 105,
    },
    light2: {
        height: 160,
        width: 65,
    },
    container: {
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "space-around",
        paddingTop: 160,
    },
    containerLogin: {
        
    },
    title: {
        fontWeight: "bold",
        letterSpacing: 2,
        fontSize: 48,
        marginBottom: 40,
    },
    titleContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 60,
    },
    formContainer: {
        display: "flex",
        alignItems: "center",
        marginHorizontal: 8,
        padding: 5,
        flex: 2,
    },
    form: {
        // borderRadius: 10,
        width: "100%",
        marginBottom: 20,
    },
    formButton: {
        marginBottom: 20,
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-around",
    },
});

// #region tab bar
export const tbStyle = StyleSheet.create({
    tabBar: {
        position: "absolute",
        bottom: 20,
        right: 0,
        left: 0,
        elevation: 0,
        height: 70,
        backgroundColor: "#004439",
        borderRadius: 30,
        marginHorizontal: 20,
    },
    tbText: {
        fontSize: 12,
        color: "#FFF",
        fontFamily: "Arimo",
        fontWeight: "bold",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        // alignSelf: "stretch",
    },
    button: {
        width: 75,
        height: 75,
        borderRadius: 45,
        borderWidth: 4,
        borderColor: "#00443900",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    circle: {
        width: 70,
        height: 70,
        // position: "absolute",
        backgroundColor: "#004439",
        justifyContent: "center",
    },
    recordBabling: {
        top: Platform.OS == "ios" ? 0 : -25,
        width: Platform.OS == "ios" ? 90 : 90,
        height: Platform.OS == "ios" ? 90 : 90,
        borderRadius: Platform.OS == "ios" ? 40 : 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00302b",
    },
});

// #region audio
export const audioStyle = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 10,
        marginRight: 10,
    },
    fill: {
        flex: 1,
        margin: 15,
        color: "#34FD",
    },
    visualizer: {
        height: 80,
        width: "30%",
        marginBottom: 20,
    },
});

// #region toast
export const toastStyle = StyleSheet.create({
    container: {
        height: "auto",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFF",
        position: "absolute",
        bottom: 20,
    },
    toast: {
        height: "auto",
        width: "90%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFF",
        padding: 10,
        borderRadius: 4,
        borderWidth: 0.4,
    },
    shadow: {
        // shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
    },
    iconContainer: {
        height: 30,
        width: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    icon: {
        width: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
        paddingLeft: 1,
        borderRadius: 25,
    },
    progressContainer: {
        height: 5,
        alignSelf: "stretch",
        backgroundColor: "#dadada",
    },
    progress: {
        height: "100%",
        width: "30%",
        position: "absolute",
        left: 0,
        backgroundColor: "#ffc107",
    },
});
