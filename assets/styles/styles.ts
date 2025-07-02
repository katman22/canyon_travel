import {StyleSheet} from "react-native";
import {Theme} from '@react-navigation/native';

const getStyles = (colors: Theme['colors']) => {

    return StyleSheet.create({
        forecastHeading: {
            fontSize: 14,
            fontWeight: 'bold',
            marginTop: -1,
            marginBottom: 0,
            marginLeft: 5,
            color: colors.primary
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
        container: {
            flex: 1,
            padding: 20, marginTop: 20

        },
        radarContainer: {
            flex: 1,
            padding: 10, marginTop: 30,
            paddingBottom: 30

        },
        header: {fontSize: 24, marginBottom: 20},
        result: {marginTop: 20, fontSize: 18},
        error: {color: 'red', marginTop: 20},
        inputGroup: {
            marginBottom: 16,
            width: '100%',
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
        goButton: {
            alignSelf: 'flex-end', // aligns the button to the right
            backgroundColor: colors.card,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 4,
        },
        goButtonText: {
            color: colors.primary,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        goButtonDisabled: {
            backgroundColor: '#ccc',
        },
        goButtonTextDisabled: {
            color: '#666',
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
        hourlyContainer: {
            position: 'relative',
            maxHeight: 280,
            minHeight: 280,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 6,
        },
        evenRow: {
            backgroundColor: colors.background,
        },

        oddRow: {
            backgroundColor: colors.card,
        },
        locationItem: {
            padding: 4
        },
        closeButton: {
            fontSize: 12,
            color: 'gray',
            borderWidth: 1,
            borderColor: '#e9ecef'
        },
        collapsibleContainer: {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            padding: 10,
            marginVertical: 10,
        },
        fullForecastContainer: {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            padding: 10,
            marginTop: 10
        },
        hourlyForecastContainer: {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            marginTop: 10,
            padding: 5
        },
        hourlyRowContainer: {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 0,
            borderRadius: 8,
            marginTop: 0,
            padding: 5
        },
        collapsibleMask: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(255, 255, 255, 0.6)', // light transparent mask
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
            borderRadius: 10,
        },
        antCollapse: {},
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
        closeAntCircle: {
            fontSize: 14,
            marginBottom: 2,
            marginLeft: 10
        },
        clearInput: {
            fontSize: 18,
            marginTop: -20,
            marginRight: 5
        },
        forecastContainer: {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            padding: 2,
            marginTop: 2,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between', // ⬅️ left group & right group
            alignItems: 'center',
            paddingHorizontal: 10,
            marginTop: 10,
        },
        leftGroup: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        rightGroup: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        floatingButton: {
            backgroundColor: colors.card,
            paddingVertical: 8,
            paddingHorizontal: 11,
            borderRadius: 20,
            marginRight: 8, // Small space between buttons
        },
        greyButton: {
            backgroundColor: '#ccc',
            paddingVertical: 8,
            paddingHorizontal: 11,
            borderRadius: 20,
            marginRight: 8, // Small space between buttons
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
        refreshTextSm: {
            color: colors.primary,
            fontSize: 10,
            fontWeight: 'bold',
            marginTop: 0
        },
        buttonTextSmTop: {
            color: colors.primary,
            fontSize: 10,
            fontWeight: 'bold',
            marginBottom: -4,
            marginTop: 0,
        },
        primaryForecastContainer: {
            padding: 16,
            backgroundColor: '#f0f0f0',
            borderRadius: 12,
            marginBottom: 20,
        },
        locationName: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 8,
        },
        lastRefreshedText: {
            fontSize: 10,
            color: '#868e96',
            marginLeft: 15,
            marginTop: -3,
            marginBottom: 4,
        },
        mainForecastRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        forecastDetails: {
            flex: 1,
        },
        periodName: {
            color: colors.primary,
            fontSize: 14,
            fontWeight: '600',
        },
        detailsName: {
            fontSize: 14,
            marginLeft: 10,
            marginTop: 10,
            fontWeight: '600',
        },
        hourlyName: {
            fontSize: 14,
            color: colors.primary,
            marginLeft: 4,
            marginTop: 2,
            marginBottom: 5,
            fontWeight: '600',
        },
        shortName: {
            fontSize: 14,
            color: "#000",
            marginLeft: 4,
            marginTop: 2,
            fontWeight: '600',
        },
        shortForecast: {
            fontSize: 14,
            color: colors.primary,
            marginTop: 4,
        },
        wind: {
            marginTop: 5,
            fontSize: 14,
            color: colors.primary,
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
        temp: {
            fontSize: 14,
            color: colors.primary,
            // marginBottom: 0,
        },
        weatherIcon: {
            width: 100,
            height: 100,
            marginLeft: 12,
        },
        detailedForecast: {
            marginLeft: 10,
            fontSize: 14,
            color: '#333',
            lineHeight: 20,
            padding: 5,
            borderRadius: 4,
        },
        shortContainer: {
            marginTop: 5,
            backgroundColor: '#f9f9f9',
            borderRadius: 4,
        },
        detailsContainer: {
            marginTop: 10,
            backgroundColor: '#f9f9f9',
            borderRadius: 4,
        },
        hourlyDetails: {
            marginTop: 10,
            backgroundColor: '#f9f9f9',
            borderRadius: 4,
        },
        topLoading: {
            marginTop: 100
        },
        horizontalScrollContainer: {
            paddingVertical: 10,
            paddingHorizontal: 5,
        },
        time: {
            fontSize: 12,
            fontWeight: 'bold',
            color: colors.primary,
            marginLeft: 3,
            marginBottom: 4,
        },
        forecast: {
            fontSize: 12,
            marginBottom: 2,
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
        },
        forecastRow: {
            flexDirection: 'row', // Stack the rows vertically
            marginBottom: 0,
            backgroundColor: '#f1f1f1',
            borderRadius: 0,
            paddingVertical: 0,
        },
        detailsRow: {
            flexDirection: 'row', // Stack the rows vertically
            marginBottom: 0,
            backgroundColor: '#ffffff',
            borderRadius: 0,
            paddingVertical: 0,
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
        radarHeading: {
            fontSize: 14,
            marginBottom: 0,
            marginTop: 20,
            fontWeight: '600'
        },
        subHeading: {fontSize: 20, marginBottom: 0},
        footer: {
            // backgroundColor: isDark ? '#222' : '#f9f9f9',
            alignItems: 'flex-end',
            padding: 0,
            marginBottom: -15,
            marginTop: -35,
            marginRight: 5
        },
        logo: {
            marginTop: 0,
            width: 120,
            marginRight: -35,
            marginBottom: 0,
            height: 40,
            resizeMode: 'contain',
        },
        headerLogo: {
            // alignItems: 'flex-start',
            padding: 5,
            marginTop: -37,
            marginRight: -110
        },
        indexFooter: {
            // backgroundColor: isDark ? '#222' : '#f9f9f9',
            alignItems: 'flex-end',
            padding: 5,
            marginBottom: -15,
            marginTop: -30,
            marginRight: 5
        },
        indexLogo: {
            // width: 60,
            height: 40,
            marginRight: 20,
            marginTop: -30,
            // marginBottom: -10,
            // resizeMode: 'contain',
        },
        logoHeader: {
            width: 60,
            height: 20,
            marginRight: -180,
            // marginTop: 30,
            marginBottom: -10,
            resizeMode: 'contain',
        },
        footerIcon: {
            width: 40,
            height: 40,
            marginRight: -5,
            marginTop: 25,
            marginBottom: -35,
            resizeMode: 'contain',
        },
        indexIcon: {
            width: 75,
            height: 44,
            marginRight: -42,
            marginTop: 9,
            marginBottom: -45,
            resizeMode: 'contain',
        },
        headerIcon: {
            width: 80,
            height: 44,
            marginTop: -10,
            marginLeft: -5  ,
            resizeMode: 'contain',
        },
        radarIcon: {
            width: 80,
            height: 20,
            marginTop: 0,
            marginBottom: 10,
            resizeMode: 'contain',
        },
        toggleButton: {
            alignSelf: 'flex-end',
            marginBottom: -10,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 20,
            backgroundColor: '#007bff', // or '#888' when inactive
        },
        toggleButtonText: {
            color: 'white',
            fontSize: 12,
            fontWeight: '600',
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
        styledFavorite:{
            color: colors.primary
        },
        nonFavorite:{
            color: colors.border
        },
        scrollContentContainer: {
            paddingBottom: 120, // enough to scroll past footer
        }
    });
}

export default getStyles;