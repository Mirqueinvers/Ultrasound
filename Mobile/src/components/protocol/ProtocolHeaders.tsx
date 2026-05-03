import { StyleSheet, Text, View } from "react-native";

type ProtocolOrganHeaderProps = {
  title: string;
};

type ProtocolSectionHeaderProps = {
  title: string;
  note?: string;
};

export function ProtocolOrganHeader({ title }: ProtocolOrganHeaderProps) {
  return (
    <View style={organHeaderStyles.container}>
      <Text style={organHeaderStyles.title}>{title}</Text>
    </View>
  );
}

export function ProtocolSectionHeader({ title, note }: ProtocolSectionHeaderProps) {
  return (
    <View style={sectionHeaderStyles.container}>
      <Text style={sectionHeaderStyles.title}>{title}</Text>
      {note ? <Text style={sectionHeaderStyles.note}>{note}</Text> : null}
    </View>
  );
}

const organHeaderStyles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
});

const sectionHeaderStyles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 4,
    paddingTop: 2,
    paddingBottom: 2,
    paddingHorizontal: 2,
    gap: 3,
  },
  title: {
    color: "#e0f2fe",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  note: {
    color: "#bfdbfe",
    fontSize: 11,
    lineHeight: 16,
  },
});

