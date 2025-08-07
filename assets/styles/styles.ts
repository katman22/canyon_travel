import {Dimensions, StyleSheet} from "react-native";
import {Theme} from '@react-navigation/native';

const getStyles = (colors: Theme['colors']) => {

    return StyleSheet.create({
        alertButton: {
            alignSelf: 'flex-start',
            backgroundColor: colors.background,
            paddingVertical: 4,
            paddingHorizontal: 6,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 20,
            marginLeft: 300,
            marginTop: -25,
            zIndex: 99
        },
        alertSection: {
            marginBottom: 10,
        },
        alertText: {
            color: '#D00',
            fontWeight: '600',
            marginBottom: 4,
        },
        antCollapse: {},
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between', // ⬅️ left group & right group
            alignItems: 'center',
            paddingHorizontal: 10,
            marginTop: 10,
        },
        buttonText: {
            color: colors.primary,
            fontSize: 8,
            fontWeight: 'bold',
        },
        buttonTextSm: {
            color: colors.primary,
            fontSize: 10,
            fontWeight: 'bold',
        },
        buttonTextSmTop: {
            color: colors.primary,
            fontSize: 10,
            fontWeight: 'bold',
            marginBottom: -4,
            marginTop: 0,
        },
        cameraCard: {
            marginBottom: 20,
            padding: 12,
            borderRadius: 8,
            backgroundColor: colors.card,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        cameraContainer: {
            padding: 12,
            backgroundColor: colors.background,
        },
        cameraImage: {
            width: '100%',
            height: 200,
            borderRadius: 6,
            backgroundColor: '#e9ecef',
        },
        cameraLocation: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 6,
        },
        clearInput: {
            fontSize: 18,
            marginTop: -20,
            marginRight: 5
        },
        closeAntCircle: {
            fontSize: 14,
            marginBottom: 2,
            marginLeft: 10
        },
        closeButton: {
            fontSize: 12,
            color: 'gray',
            borderWidth: 1,
            borderColor: '#e9ecef'
        },
        closure: {
            marginTop: 6,
            color: '#D00',
            fontWeight: 'bold',
        },
        collapsibleContainer: {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            padding: 10,
            marginVertical: 10,
        },
        collapsibleMask: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(255, 255, 255, 0.6)', // light transparent mask
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
            borderRadius: 10,
        },
        collapsibleText: {
            fontSize: 18,
            marginBottom: 0
        },
        collapsibleTextSm: {
            fontSize: 10,
            marginLeft: 5,
            marginBottom: 0,
            fontWeight: '600',
            color: colors.primary
        },
        conditionCard: {
            backgroundColor: '#f9f9f9',
            padding: 10,
            borderRadius: 6,
            marginBottom: 8,
        },

        conditionText: {
            fontSize: 12,
        },
        conditionsSection: {
            marginTop: 12,
        },
        container: {
            flex: 1,
            padding: 4, marginTop: 20

        },
        contentContainer: {
            padding: 16,
            backgroundColor: 'white'
        },
        description: {
            fontSize: 14,
            color: '#555',
            marginBottom: 8,
        },
        detailedForecast: {
            marginLeft: 10,
            fontSize: 14,
            color: '#333',
            lineHeight: 20,
            padding: 5,
            borderRadius: 4,
        },
        detailsContainer: {
            marginTop: 10,
            backgroundColor: '#f9f9f9',
            borderRadius: 4,
        },
        detailsName: {
            fontSize: 14,
            marginLeft: 10,
            marginTop: 10,
            fontWeight: '600',
        },
        detailsRow: {
            flexDirection: 'row', // Stack the rows vertically
            marginBottom: 0,
            backgroundColor: '#ffffff',
            borderRadius: 0,
            paddingVertical: 0,
        },
        error: {color: 'red', marginTop: 20},
        evenRow: {
            backgroundColor: colors.background,
        },
        eventCard: {
            padding: 12,
            borderRadius: 6,
            backgroundColor: '#e9ecef',
            marginBottom: 10,
        },
        eventComment: {
            fontSize: 12,
            fontStyle: 'italic',
            color: '#555',
        },
        eventDescription: {
            fontSize: 13,
            marginBottom: 6,
        },
        eventHeader: {
            fontWeight: 'bold',
            fontSize: 14,
            marginBottom: 6,
        },
        eventMeta: {
            fontSize: 12,
            color: '#444',
        },
        eventSection: {
            marginTop: 16,
        },
        favButton: {
            alignSelf: 'flex-start',
            backgroundColor: colors.background,
            paddingVertical: 4,
            paddingHorizontal: 6,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 20,
            marginLeft: 50,
            marginTop: 10,
            marginBottom: -30,
            zIndex: 99
        },
        floatingButton: {
            backgroundColor: colors.card,
            paddingVertical: 8,
            paddingHorizontal: 11,
            borderRadius: 20,
            marginRight: 8, // Small space between buttons
        },
        footer: {
            // backgroundColor: isDark ? '#222' : '#f9f9f9',
            alignItems: 'flex-end',
            padding: 0,
            marginBottom: -15,
            marginTop: -35,
            marginRight: 5
        },
        footerIcon: {
            width: 40,
            height: 40,
            marginRight: -5,
            marginTop: 25,
            marginBottom: -35,
            resizeMode: 'contain',
        },
        footerText: {
            fontSize: 12,
            color: '#777',
            marginTop: 8,
        },
        forecast: {
            fontSize: 12,
            marginBottom: 2,
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
        },
        forecastCard: {
            backgroundColor: '#f8f9fa',
            borderRadius: 12,
            padding: 16,
            marginBottom: 10,
            elevation: 2, // Android shadow
            shadowColor: '#000', // iOS shadow
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
            justifyContent: 'space-between',
        },
        forecastColumn: {
            flexDirection: 'column', // Arrange the data vertically in each column
            // justifyContent: 'center',
            // alignItems: 'center',
            marginRight: 1, // Space between columns
            padding: 2,
            // backgroundColor: '#ffffff',
            borderRadius: 1,
            width: 50, // Width of each column
        },
        forecastContainer: {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            padding: 2,
            marginTop: 2,
        },
        forecastDayColumn: {
            flexDirection: 'column', // Arrange the data vertically in each column
            justifyContent: 'center',
            alignItems: 'flex-start',
            marginRight: 1, // Space between columns
            padding: 2,
            // backgroundColor: '#ffffff',
            borderRadius: 1,
            width: 75, // Width of each column
        },
        forecastDetails: {
            flex: 1,
        },
        forecastHeading: {
            fontSize: 14,
            fontWeight: 'bold',
            marginTop: -1,
            marginBottom: 0,
            marginLeft: 5,
            color: colors.primary
        },
        forecastRow: {
            flexDirection: 'row', // Stack the rows vertically
            marginBottom: 0,
            backgroundColor: '#f1f1f1',
            borderRadius: 0,
            paddingVertical: 0,
        },
        fullButton: {
            alignSelf: 'flex-start',
            backgroundColor: '#007bff',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            marginLeft: 10,
            marginTop: -20
        },
        fullForecastContainer: {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            padding: 10,
            marginTop: 10
        },
        fullForecastHeading: {
            alignSelf: 'flex-end',
            fontSize: 14,
            fontWeight: 'bold',
            marginTop: 5,
            marginBottom: 10,
            marginLeft: -200,
            width: 200,
            color: colors.primary
        },
        goButton: {
            alignSelf: 'flex-end', // aligns the button to the right
            backgroundColor: colors.card,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 4,
        },
        goButtonDisabled: {
            backgroundColor: '#ccc',
        },
        goButtonText: {
            color: colors.primary,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        goButtonTextDisabled: {
            color: '#666',
        },
        greyButton: {
            backgroundColor: '#ccc',
            paddingVertical: 8,
            paddingHorizontal: 11,
            borderRadius: 20,
            marginRight: 8, // Small space between buttons
        },
        header: {fontSize: 24, marginBottom: 20},
        headerIcon: {
            width: 80,
            height: 44,
            marginTop: -10,
            marginLeft: -5,
            resizeMode: 'contain',
        },
        headerLogo: {
            // alignItems: 'flex-start',
            padding: 5,
            marginTop: -37,
            marginRight: -110
        },
        horizontalScrollContainer: {
            paddingVertical: 10,
            paddingHorizontal: 5,
        },
        hourlyContainer: {
            position: 'relative',
            maxHeight: 280,
            minHeight: 280,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 6,
        },
        hourlyDetails: {
            marginTop: 10,
            backgroundColor: '#f9f9f9',
            borderRadius: 4,
        },
        hourlyForecastContainer: {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            marginTop: 10,
            padding: 5
        },
        hourlyName: {
            fontSize: 14,
            color: colors.primary,
            marginLeft: 4,
            marginTop: 2,
            marginBottom: 5,
            fontWeight: '600',
        },
        hourlyRowContainer: {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 0,
            borderRadius: 8,
            marginTop: 0,
            padding: 5
        },
        indexFooter: {
            // backgroundColor: isDark ? '#222' : '#f9f9f9',
            alignItems: 'flex-end',
            padding: 5,
            marginBottom: -15,
            marginTop: -30,
            marginRight: 5
        },
        indexIcon: {
            width: 75,
            height: 44,
            marginRight: -42,
            marginTop: 9,
            marginBottom: -45,
            resizeMode: 'contain',
        },
        indexLogo: {
            // width: 60,
            height: 40,
            marginRight: 20,
            marginTop: -30,
            // marginBottom: -10,
            // resizeMode: 'contain',
        },
        infoLine: {
            fontSize: 14,
            marginBottom: 4
        },
        infoText: {
            fontSize: 14,
            marginBottom: 4,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            borderRadius: 4,
            color: colors.notification,
            padding: 10,
            marginBottom: 8, // space between input and button
        },
        inputGroup: {
            marginBottom: 16,
            width: '100%',
        },
        label: {
            fontWeight: '600',
            marginRight: 6
        },
        lastRefreshedText: {
            fontSize: 10,
            color: '#868e96',
            marginLeft: 15,
            marginTop: -3,
            marginBottom: 4,
        },
        leftGroup: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        locationItem: {
            padding: 4
        },
        locationListContainer: {
            position: 'relative',
            maxHeight: 200,
            overflow: 'hidden',
            marginTop: 5,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 6,
        },
        locationName: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 8,
        },
        logo: {
            marginTop: 0,
            width: 120,
            marginRight: -35,
            marginBottom: 0,
            height: 40,
            resizeMode: 'contain',
        },
        logoHeader: {
            width: 60,
            height: 20,
            marginRight: -180,
            // marginTop: 30,
            marginBottom: -10,
            resizeMode: 'contain',
        },
        mainForecastRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        map: {
            width: Dimensions.get('window').width,
            height: (Dimensions.get('window').height - 90) * (2 / 3),
        },
        map_view: {
            ...StyleSheet.absoluteFillObject,
            zIndex: 0,
        },
        noAlertText: {
            fontSize: 14,
            color: 'green',
            marginBottom: 10,
        },
        nonFavorite: {
            color: colors.border
        },
        notifyButton: {
            alignSelf: 'flex-start',
            backgroundColor: colors.background,
            paddingVertical: 0,
            paddingHorizontal: 0,
            borderColor: colors.border,
            borderWidth: 0,
            borderRadius: 0,
            marginLeft: 48,
            marginTop: -25,
            zIndex: 99
        },
        oddRow: {
            backgroundColor: colors.card,
        },
        panelHeader: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 4,
        },
        panelSubtext: {
            fontSize: 14,
            marginBottom: 8,
        },
        parentContainer: {
            flex: 1,
            justifyContent: 'space-between',
            paddingBottom: 60, // Give breathing room for the banner
        },
        parentRadarContainer: {
            flex: 1,
            justifyContent: 'space-between',
            paddingBottom: 10, // Give breathing room for the banner
            paddingTop: 20
        },
        periodName: {
            color: colors.primary,
            fontSize: 14,
            fontWeight: '600',
        },
        precipMain: {
            fontSize: 14,
            color: colors.primary,
        },
        precipitation: {
            fontSize: 6,
            color: colors.primary,
            marginTop: -1
        },
        primaryForecastContainer: {
            padding: 16,
            backgroundColor: '#f0f0f0',
            borderRadius: 12,
            marginBottom: 20,
        },
        radarContainer: {
            flex: 1,
            padding: 10, marginTop: 30,
            paddingBottom: 30

        },
        radarHeading: {
            fontSize: 14,
            marginBottom: 0,
            marginTop: 20,
            fontWeight: '600'
        },
        radarIcon: {
            width: 80,
            height: 20,
            marginTop: 0,
            marginBottom: 10,
            resizeMode: 'contain',
        },
        refreshButton: {
            alignSelf: 'flex-end',
            marginBottom: 12,
            paddingVertical: 6,
            paddingHorizontal: 12,
            backgroundColor: colors.primary,
            borderRadius: 20,
        },
        refreshText: {
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
        },
        refreshTextSm: {
            color: colors.primary,
            fontSize: 10,
            fontWeight: 'bold',
            marginTop: 0
        },
        result: {marginTop: 20, fontSize: 18},
        rightGroup: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        roadName: {
            fontWeight: 'bold',
            fontSize: 13,
            marginBottom: 4,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 6
        },
        scrollContentContainer: {
            paddingBottom: 120, // enough to scroll past footer
        },
        shortContainer: {
            marginTop: 5,
            backgroundColor: '#f9f9f9',
            borderRadius: 4,
        },
        shortForecast: {
            fontSize: 14,
            color: colors.primary,
            marginTop: 4,
        },
        shortName: {
            fontSize: 14,
            color: "#000",
            marginLeft: 4,
            marginTop: 2,
            fontWeight: '600',
        },
        showColumn: {
            flexDirection: 'column', // Arrange the data vertically in each column
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 1, // Space between columns
            padding: 2,
            // backgroundColor: '#ffffff',
            borderRadius: 1,
            width: 30, // Width of each column
        },
        smButton: {
            alignSelf: 'flex-start',
            backgroundColor: colors.background,
            paddingVertical: 4,
            paddingHorizontal: 6,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 20,
            marginLeft: 10,
            marginTop: -13
        },
        styledFavorite: {
            color: colors.primary
        },

        subHeading: {fontSize: 20, marginBottom: 0},

        subText: {
            fontSize: 14,
            marginBottom: 8
        },

        summaryCard: {
            padding: 12,
            backgroundColor: '#FFE08A',
            borderRadius: 6,
            marginBottom: 10,
        },

        summaryText: {
            fontWeight: '600',
            fontSize: 14,
        },

        temp: {
            fontSize: 14,
            color: colors.primary,
            // marginBottom: 0,
        },

        tempColumn: {
            flexDirection: 'column', // Arrange the data vertically in each column
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 1, // Space between columns
            padding: 2,
            // backgroundColor: '#ffffff',
            borderRadius: 1,
            width: 50, // Width of each column
        },

        tile: {
            margin: 12,
            padding: 10,
            backgroundColor: '#f8f8f8',
            borderRadius: 12,
            elevation: 2,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 6,
            shadowOffset: {width: 0, height: 2}
        },

        time: {
            fontSize: 12,
            fontWeight: 'bold',
            color: colors.primary,
            marginLeft: 3,
            marginBottom: 4,
        },

        timeValue: {
            fontSize: 22,
            fontWeight: 'bold',
            marginRight: 16
        },

        title: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 4,
        },

        toggleButton: {
            alignSelf: 'flex-end',
            marginBottom: -10,
            marginTop: -10,
            paddingVertical: 2,
            paddingHorizontal: 8,
            color: 'white',
            borderRadius: 20,
            zIndex: 99,
            backgroundColor: '#007bff', // or '#888' when inactive
        },

        toggleButtonText: {
            fontSize: 12,
            fontWeight: '600',
        },

        toggleText: {
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '600',
        },

        topLoading: {
            marginTop: 100
        },

        travelInfoPanel: {
            backgroundColor: 'white',
            padding: 4,
            width: Dimensions.get('window').width,
            height: (Dimensions.get('window').height - 90) * (1 / 3),
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderColor: '#ccc',
            borderWidth: 1,
            overflow: 'hidden'
        },
        updated: {
            fontSize: 12,
            color: '#777',
            marginTop: 8
        },
        weatherIcon: {
            width: 100,
            height: 100,
            marginLeft: 12,
        },
        wind: {
            marginTop: 5,
            fontSize: 14,
            color: colors.primary,
        },
        windColumn: {
            flexDirection: 'column', // Arrange the data vertically in each column
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 1, // Space between columns
            padding: 2,
            // backgroundColor: '#ffffff',
            borderRadius: 1,
            marginBottom: 6,
            width: 95, // Width of each column
        }

    });
}

export default getStyles;