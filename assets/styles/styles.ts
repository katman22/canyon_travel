import {Dimensions, StyleSheet} from "react-native";
import type {Theme} from "@react-navigation/native";

type ExtraTokens = {
    muted?: string;     // subdued text
    success?: string;   // success accents
    warning?: string;   // warning accents
    danger?: string;    // error accents
};
type Palette = Theme["colors"] & ExtraTokens;

const getStyles = (colors: Theme["colors"]) => {
    // allow custom tokens if you added them in your theme.ts
    const c = colors as Palette;

    return StyleSheet.create({
        alertButton: {
            alignSelf: "flex-start",
            backgroundColor: c.background,
            paddingVertical: 4,
            paddingHorizontal: 6,
            borderColor: c.border,
            borderWidth: 1,
            borderRadius: 20,
            marginLeft: 300,
            marginTop: -25,
            zIndex: 99,
        },
        alertSection: {marginBottom: 10},
        alertSectionResort: { gap: 4, paddingVertical: 4 },
        alertText: {
            color: c.danger ?? "#D00",
            fontWeight: "600",
            marginBottom: 4,
        },

        antCollapse: {},

        buttonRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 10,
            marginTop: 10,
        },

        buttonText: {color: c.primary, fontSize: 8, fontWeight: "bold"},
        buttonTextSm: {color: c.primary, fontSize: 10, fontWeight: "bold"},
        buttonTextSmTop: {
            color: c.primary,
            fontSize: 10,
            fontWeight: "bold",
            marginBottom: -4,
            marginTop: 0,
        },

        cameraCard: {
            marginBottom: 20,
            padding: 12,
            borderRadius: 8,
            backgroundColor: c.card,
            shadowColor: "#000",
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        cameraContainer: {
            padding: 12,
            backgroundColor: c.background,
        },
        cameraImage: {
            width: "100%",
            height: 200,
            borderRadius: 6,
            backgroundColor: c.border,
        },
        cameraLocation: {
            fontSize: 14,
            fontWeight: "600",
            color: c.text,
            marginBottom: 6,
        },

        clearInput: {fontSize: 18, marginTop: -20, marginRight: 5},
        closeAntCircle: {fontSize: 14, marginBottom: 2, marginLeft: 10},
        closeButton: {
            fontSize: 12,
            color: c.muted ?? "#808080",
            borderWidth: 1,
            borderColor: c.border,
        },

        closure: {
            marginTop: 6,
            color: c.danger ?? "#D00",
            fontWeight: "bold",
        },

        collapsibleContainer: {
            backgroundColor: c.background,
            borderColor: c.border,
            borderWidth: 1,
            borderRadius: 8,
            padding: 10,
            marginVertical: 10,
        },
        // NOTE: if you want a dark-aware mask, switch it where you render (you can’t easily apply alpha to an arbitrary theme color here)
        collapsibleMask: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(255,255,255,0.6)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
            borderRadius: 10,
        },
        collapsibleText: {fontSize: 18, marginBottom: 0},
        collapsibleTextSm: {
            fontSize: 10,
            marginLeft: 5,
            marginBottom: 0,
            fontWeight: "600",
            color: c.primary,
        },

        conditionCard: {
            backgroundColor: c.card,
            padding: 10,
            borderRadius: 6,
            marginBottom: 8,
        },
        conditionText: {fontSize: 12, color: c.text},

        conditionsSection: {marginTop: 12},

        container: {flex: 1, padding: 4, marginTop: 20},
        settingContainer: {
            padding: 16,
        },
        contentContainer: {padding: 16, backgroundColor: c.background},

        description: {fontSize: 14, color: c.muted ?? "#555", marginBottom: 8},

        detailedForecast: {
            marginLeft: 10,
            fontSize: 14,
            color: c.text,
            lineHeight: 20,
            padding: 5,
            borderRadius: 4,
        },
        defaultBackground: {flex: 1, backgroundColor: '#fff'},
        detailsContainer: {marginTop: 10, backgroundColor: c.card, borderRadius: 4},
        detailsName: {fontSize: 14, marginLeft: 10, marginTop: 10, fontWeight: "600"},
        detailsRow: {
            flexDirection: "row",
            marginBottom: 0,
            backgroundColor: c.card,
            borderRadius: 0,
            paddingVertical: 0,
        },
        dirBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16 },
        dirBtnActive: { backgroundColor: '#4285F4' },
        dirBtnIdle: { backgroundColor: '#cfd8dc' },
        dirBtnDisabled: { backgroundColor: '#eceff1' },

        error: {color: c.danger ?? "red", marginTop: 20},

        evenRow: {backgroundColor: c.background},

        eventCard: {
            padding: 12,
            borderRadius: 6,
            backgroundColor: c.card,
            marginBottom: 10,
        },
        eventComment: {fontSize: 12, fontStyle: "italic", color: c.muted ?? "#555"},
        eventDescription: {fontSize: 13, marginBottom: 6, color: c.text},
        eventHeader: {fontWeight: "bold", fontSize: 14, marginBottom: 6, color: c.text},
        eventMeta: {fontSize: 12, color: c.muted ?? "#444"},
        eventSection: {marginTop: 16},
        exAlertText: { fontSize: 12, color: '#78909C', marginTop: 4 },

        fab: {
            position: "absolute",
            zIndex: 20,
            elevation: 6,         // Android shadow
            padding: 4,
            borderRadius: 4,
            backgroundColor: "rgba(255,255,255,0.92)",
        },
        fabIcon: {
            width: 22,
            height: 22,
            opacity: 0.9,
            // tintColor: "#111", // uncomment to force color if needed
        },
        favButton: {
            alignSelf: "flex-start",
            backgroundColor: c.background,
            paddingVertical: 4,
            paddingHorizontal: 6,
            borderColor: c.border,
            borderWidth: 1,
            borderRadius: 20,
            marginLeft: 50,
            marginTop: 10,
            marginBottom: -30,
            zIndex: 99,
        },

        floatingButton: {
            backgroundColor: c.card,
            paddingVertical: 8,
            paddingHorizontal: 11,
            borderRadius: 20,
            marginRight: 8,
        },

        footer: {alignItems: "flex-end", padding: 0, marginBottom: -15, marginTop: -35, marginRight: 5},
        footerIcon: {
            width: 40,
            height: 40,
            marginRight: -5,
            marginTop: 25,
            marginBottom: -35,
            resizeMode: "contain",
        },
        footerText: {fontSize: 12, color: c.muted ?? "#777", marginTop: 8},

        forecast: {fontSize: 12, marginBottom: 2, justifyContent: "flex-start", alignItems: "flex-start"},

        forecastCard: {
            backgroundColor: c.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 10,
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
            justifyContent: "space-between",
        },

        forecastColumn: {flexDirection: "column", marginRight: 1, padding: 2, borderRadius: 1, width: 50},
        forecastContainer: {
            backgroundColor: c.background,
            borderColor: c.border,
            borderWidth: 1,
            borderRadius: 8,
            padding: 2,
            marginTop: 2,
        },
        forecastDayColumn: {
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            marginRight: 1,
            padding: 2,
            borderRadius: 1,
            width: 75,
        },
        forecastDetails: {flex: 1},
        forecastHeading: {
            fontSize: 14,
            fontWeight: "bold",
            marginTop: -1,
            marginBottom: 0,
            marginLeft: 5,
            color: c.primary
        },
        forecastRow: {
            flexDirection: "row",
            marginBottom: 0,
            backgroundColor: c.card,
            borderRadius: 0,
            paddingVertical: 0
        },

        fullButton: {
            alignSelf: "flex-start",
            backgroundColor: c.primary,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            marginLeft: 10,
            marginTop: -20,
        },

        fullForecastContainer: {
            backgroundColor: c.background,
            borderColor: c.border,
            borderWidth: 1,
            borderRadius: 8,
            padding: 10,
            marginTop: 10,
        },
        fullForecastHeading: {
            alignSelf: "flex-end",
            fontSize: 14,
            fontWeight: "bold",
            marginTop: 5,
            marginBottom: 10,
            marginLeft: -200,
            width: 200,
            color: c.primary,
        },

        goButton: {
            alignSelf: "flex-end",
            backgroundColor: c.card,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 4,
        },
        goButtonDisabled: {backgroundColor: c.border},
        goButtonText: {color: c.primary, fontWeight: "bold", textAlign: "center"},
        goButtonTextDisabled: {color: c.muted ?? "#666"},

        greyButton: {
            backgroundColor: c.border,
            paddingVertical: 8,
            paddingHorizontal: 11,
            borderRadius: 20,
            marginRight: 8,
        },

        header: {fontSize: 24, marginBottom: 20, color: c.text},
        headerIcon: {width: 80, height: 44, marginTop: -10, marginLeft: -5, resizeMode: "contain"},
        headerLogo: {padding: 5, marginTop: -37, marginRight: -110},
        heading: {
            fontSize: 18,
            fontWeight: "700",
            color: "#1B1B1B",
        },
        horizontalScrollContainer: {paddingVertical: 10, paddingHorizontal: 5},
        homeResWrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 96 },
        homeResHeading: { fontSize: 18, fontWeight: "700", color: "#1B1B1B" },
        homeResSubheading: { fontSize: 13, color: "#555", marginBottom: 8 },
        homeResChangesPill: {
            alignSelf: "flex-start",
            backgroundColor: "#EEF7EE",
            borderRadius: 999,
            paddingVertical: 4,
            paddingHorizontal: 10,
            marginBottom: 8,
        },
        homeResChangesText: { color: "#2E7D32", fontWeight: "600", fontSize: 12 },
        homeResRow: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: "#e0e0e0",
        },
        homeResName: { fontWeight: "600", color: "#222" },
        homeResSubText: { fontSize: 12, color: "#666" },
        homeResSaveBtn: {
            marginTop: 12,
            backgroundColor: "#2E7D32",
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: "center",
        },
        homeResSaveText: { color: "#fff", fontWeight: "700" },
        hourlyContainer: {
            position: "relative",
            maxHeight: 280,
            minHeight: 280,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 6,
        },
        hourlyDetails: {marginTop: 10, backgroundColor: c.card, borderRadius: 4},

        hourlyForecastContainer: {
            backgroundColor: c.background,
            borderColor: c.border,
            borderWidth: 1,
            borderRadius: 8,
            marginTop: 10,
            padding: 5,
        },
        hourlyName: {
            fontSize: 14,
            color: c.primary,
            marginLeft: 4,
            marginTop: 2,
            marginBottom: 5,
            fontWeight: "600",
        },
        hourlyRowContainer: {
            backgroundColor: c.background,
            borderColor: c.border,
            borderWidth: 0,
            borderRadius: 8,
            marginTop: 0,
            padding: 5,
        },

        indexFooter: {alignItems: "flex-end", padding: 5, marginBottom: -15, marginTop: -30, marginRight: 5},
        indexIcon: {
            width: 75,
            height: 44,
            marginRight: -42,
            marginTop: 9,
            marginBottom: -45,
            resizeMode: "contain",
        },
        indexLogo: {height: 40, marginRight: 20, marginTop: -30},

        infoLine: {fontSize: 14, marginBottom: 4, color: c.text},
        infoText: {fontSize: 14, marginBottom: 4, color: c.text},

        input: {
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.card,
            borderRadius: 4,
            color: c.text,
            padding: 10,
            marginBottom: 8,
        },
        inputGroup: {marginBottom: 16, width: "100%"},

        label: {fontWeight: "600", marginRight: 6, color: c.text},

        lastRefreshedText: {fontSize: 10, color: c.muted ?? "#868e96", marginLeft: 15, marginTop: -3, marginBottom: 4},

        leftGroup: {flexDirection: "row", alignItems: "center"},

        locationItem: {padding: 4},
        locationListContainer: {
            position: "relative",
            maxHeight: 200,
            overflow: "hidden",
            marginTop: 5,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 6,
        },
        locationName: {fontSize: 24, fontWeight: "bold", marginBottom: 8, color: c.text},

        logo: {marginTop: 0, width: 120, marginRight: -35, marginBottom: 0, height: 40, resizeMode: "contain"},
        logoHeader: {width: 60, height: 20, marginRight: -180, marginBottom: -10, resizeMode: "contain"},

        lockedCamera: {position: "relative", overflow: "hidden"},
        lockedOverlay: {
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2,
        },
        lockedText: {color: c.background, fontWeight: "bold", fontSize: 16, textAlign: "center"},

        mainForecastRow: {flexDirection: "row", justifyContent: "space-between", alignItems: "center"},

        map: {
            width: Dimensions.get("window").width,
            height: (Dimensions.get("window").height - 90) * (2 / 3),
        },
        map_view: {...StyleSheet.absoluteFillObject, zIndex: 0, backgroundColor: '#e8eef4'},

        noAlertText: {fontSize: 14, color: c.success ?? "green", marginBottom: 5},
        name: {
            fontWeight: "600",
            color: "#222",
        },
        nonFavorite: {color: c.border},

        notifyButton: {
            alignSelf: "flex-start",
            backgroundColor: c.background,
            paddingVertical: 0,
            paddingHorizontal: 0,
            borderColor: c.border,
            borderWidth: 0,
            borderRadius: 0,
            marginLeft: 48,
            marginTop: -25,
            zIndex: 99,
        },

        oddRow: {backgroundColor: c.card},
        overlay: {
            ...StyleSheet.absoluteFillObject,
            zIndex: 10,
        },

        panelHeader: {
            fontSize: 18,
            opacity: 0.7,
            color: c.text,
            fontWeight: "bold",
            marginBottom: 4,
        },
        panelSubtext: {fontSize: 14, marginBottom: 8, fontStyle: "italic", color: c.muted ?? c.text},

        parentContainer: {flex: 1, justifyContent: "space-between", paddingBottom: 60},
        parentRadarContainer: {flex: 1, justifyContent: "space-between", paddingBottom: 10, paddingTop: 20},

        periodName: {color: c.primary, fontSize: 14, fontWeight: "600"},
        precipMain: {fontSize: 14, color: c.primary},
        precipitation: {fontSize: 6, color: c.primary, marginTop: -1},

        primaryForecastContainer: {padding: 16, backgroundColor: c.card, borderRadius: 12, marginBottom: 20},

        radarContainer: {flex: 1, padding: 10, marginTop: 30, paddingBottom: 30},
        radarHeading: {fontSize: 14, marginBottom: 0, marginTop: 20, fontWeight: "600", color: c.text},
        radarIcon: {width: 80, height: 20, marginTop: 0, marginBottom: 10, resizeMode: "contain"},

        refreshButton: {marginBottom: 12, paddingVertical: 6},
        refreshText: {color: c.background, fontSize: 12, fontWeight: "bold"},
        refreshTextSm: {color: c.primary, fontSize: 10, fontWeight: "bold", marginTop: 0},

        result: {marginTop: 20, fontSize: 18, color: c.text},

        rightGroup: {flexDirection: "row", alignItems: "center"},

        roadName: {fontWeight: "bold", fontSize: 13, marginBottom: 4, color: c.text},

        row: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
        },

        rowCheck: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 6,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: "#ccc",
        },


        saveBtn: {
            marginTop: 16,
            backgroundColor: "#2E7D32",
            paddingVertical: 10,
            borderRadius: 6,
            alignItems: "center",
        },
        saveText: {
            color: "#fff",
            fontWeight: "700",
        },
        scrollContentContainer: {paddingBottom: 120},
        settingsCard: {
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 12,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: "#e0e0e0",
            marginBottom: 12,
        },
        scrollTitle: {fontSize: 16, fontWeight: "700", color: "#111"},
        scrollBlurb: {fontSize: 13, color: "#444", marginTop: 4, marginBottom: 10},
        scrollRow: {flexDirection: "row", gap: 10},
        scrollBtn: {
            flex: 1,
            backgroundColor: "#2E7D32",
            borderRadius: 8,
            paddingVertical: 10,
            alignItems: "center",
        },
        scrollBtnText: {color: "#fff", fontWeight: "700"},
        scrollBtnSecondary: {
            backgroundColor: "#E8F5E9",
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: "#C8E6C9",
        },
        scrollBtnSecondaryText: {color: "#2E7D32", fontWeight: "700"},
        scrollNote: {marginTop: 8, fontSize: 12, color: "#777"},
        shortContainer: {marginTop: 5, backgroundColor: c.card, borderRadius: 4},
        shortForecast: {fontSize: 14, color: c.primary, marginTop: 4},
        shortName: {fontSize: 14, color: c.text, marginLeft: 4, marginTop: 2, fontWeight: "600"},

        showColumn: {
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 1,
            padding: 2,
            borderRadius: 1,
            width: 30
        },

        smButton: {
            alignSelf: "flex-start",
            backgroundColor: c.background,
            paddingVertical: 4,
            paddingHorizontal: 6,
            borderColor: c.border,
            borderWidth: 1,
            borderRadius: 20,
            marginLeft: 10,
            marginTop: -13,
        },
        statusCard: {
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 12,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: "#e0e0e0",
            marginBottom: 12,
        },
        statusTitle: {fontSize: 16, fontWeight: "700", color: "#111"},
        statusTier: {fontSize: 14, fontWeight: "800", marginTop: 2, color: "#2E7D32"},
        statusBlurb: {fontSize: 13, color: "#444", marginTop: 6},
        statusEntitlements: {fontSize: 12, color: "#666", marginTop: 6},
        statusRow: {flexDirection: "row", gap: 10, marginTop: 10},
        statusBtn: {
            flex: 1,
            backgroundColor: "#2E7D32",
            borderRadius: 8,
            paddingVertical: 10,
            alignItems: "center",
        },
        statusBtnText: {color: "#fff", fontWeight: "700"},
        statusBtnSecondary: {
            flex: 1,
            backgroundColor: "#E8F5E9",
            borderRadius: 8,
            paddingVertical: 10,
            alignItems: "center",
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: "#C8E6C9",
        },
        statusBtnSecondaryText: {color: "#2E7D32", fontWeight: "700"},
        statusManage: {marginTop: 8, alignSelf: "flex-start"},
        statusManageText: {color: "#1a73e8", fontWeight: "700", textDecorationLine: "underline"},
        statusStyledFavorite: {color: c.primary},
        subheading: {
            fontSize: 14,
            color: "#444",
            marginBottom: 12,
        },
        subHeading: {fontSize: 20, marginBottom: 0, color: c.text},
        subText: {fontSize: 14, marginBottom: 8, color: c.text},
        subscriptionPlan: {color: '#000', fontSize: 26, fontWeight: "800", marginBottom: 4},
        subscriptionDescription: {color: '#000', opacity: 0.8, marginBottom: 12},
        subDetails: {color: '#000', marginTop: 8, opacity: 0.7},
        // Use a neutral card with a warning accent instead of a fixed yellow block
        summaryCard: {
            padding: 12,
            backgroundColor: c.card,
            borderRadius: 6,
            marginBottom: 10,
            borderLeftWidth: 4,
            borderLeftColor: c.warning ?? c.primary,
        },
        sheetBackground: {
            paddingVertical: 120,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
        },
        sheetContent: {paddingHorizontal: 10},
        section: {marginTop: 20, fontSize: 16, fontWeight: "600", color: c.text},

        text: {fontSize: 15, marginTop: 6, color: c.text},
        textSmall: {fontSize: 13, color: c.muted ?? "#555", marginTop: 6},
        textWrap: {
            marginLeft: 8,
            flex: 1,
        },
        summaryText: {fontWeight: "600", fontSize: 14, color: c.text},

        temp: {fontSize: 14, color: c.primary},
        tempColumn: {
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 1,
            padding: 2,
            borderRadius: 1,
            width: 50
        },

        tile: {
            marginBottom: 10,
            padding: 10,
            backgroundColor: c.card,
            borderRadius: 12,
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 6,
            shadowOffset: {width: 0, height: 2},
        },

        time: {fontSize: 12, fontWeight: "bold", color: c.primary, marginLeft: 3, marginBottom: 4},
        timeValue: {fontSize: 22, fontWeight: "bold", marginRight: 16, color: c.text},

        title: {fontSize: 18, fontWeight: "600", marginBottom: 4, color: c.text},

        toggleButton: {
            alignSelf: "flex-end",
            marginBottom: -10,
            marginTop: -10,
            paddingVertical: 2,
            paddingHorizontal: 8,
            borderRadius: 20,
            zIndex: 99,
            backgroundColor: c.primary,
        },
        toggleButtonText: {fontSize: 12, fontWeight: "600", color: c.background},
        toggleText: {color: c.background, fontSize: 12, fontWeight: "600"},

        topLoading: {marginTop: 100},

        travelInfoPanel: {
            backgroundColor: c.card,
            paddingHorizontal: 4,
        },

        updated: {fontSize: 12, color: c.muted ?? "#777", marginTop: 8},

        weatherIcon: {width: 100, height: 100, marginLeft: 12},
        weatherCard: {
            padding: 12,
            backgroundColor: c.card,
            borderRadius: 6,
            marginBottom: 10,
        },
        wind: {marginTop: 5, fontSize: 14, color: c.primary},
        windColumn: {
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 1,
            padding: 2,
            borderRadius: 1,
            marginBottom: 6,
            width: 95
        },


        bold: {fontWeight: "bold"},

        buttonRowBottom: {
            marginTop: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
        },
    });
};

export default getStyles;
