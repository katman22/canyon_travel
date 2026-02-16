import { requireNativeComponent, ViewProps } from "react-native";

type Props = ViewProps & {
    lat: number;
    lng: number;
};

const NativeRadarMapView =
    requireNativeComponent<Props>("RadarMapView");

export default function RadarMapView(props: Props) {
    return <NativeRadarMapView {...props} />;
}
