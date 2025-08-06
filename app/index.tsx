import { useEffect } from "react";
import { Text, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import ResortSelectorScreen from "@/components/ResortSelectorScreen";
import { useSelectedResort } from "@/context/ResortContext";
import { useRouter } from "expo-router";

export default function Index() {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const { resort, loading } = useSelectedResort();
    const router = useRouter();

    useEffect(() => {
        if (!loading && resort) {
            router.replace("/tabs/to_resort");
        }
    }, [loading, resort]);

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <ResortSelectorScreen />
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontWeight: "bold" }}>Selected Resort:</Text>
                {resort ? (
                    <Text>{resort.name} (theme: {resort.theme})</Text>
                ) : (
                    <Text>None selected yet</Text>
                )}
            </View>
        </View>
    );
}
