import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from '@react-navigation/elements';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, spacingY } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import { Ionicons } from '@expo/vector-icons';

export default function CustomTabs({ state, descriptors, navigation }:BottomTabBarProps) {

  const tabbarIcons:any = {
    index: (isFocused:boolean)=>(<Ionicons name='home' size={verticalScale(30)} color={isFocused ? colors.primary: colors.neutral400} />),
    statistics: (isFocused:boolean)=>(<Ionicons name='stats-chart' size={verticalScale(30)} color={isFocused ? colors.primary: colors.neutral400} />),
    wallet: (isFocused:boolean)=>(<Ionicons name='wallet' size={verticalScale(30)} color={isFocused ? colors.primary: colors.neutral400} />),
    profile: (isFocused:boolean)=>(<Ionicons name='person' size={verticalScale(30)} color={isFocused ? colors.primary: colors.neutral400} />),
  };
  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };
        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };
        return (
          <TouchableOpacity
            key={route.name}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabbarItem}
          >
            {tabbarIcons[route.name] && tabbarIcons[route.name](isFocused)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
    tabbar: {
        flexDirection: 'row',
        width: '100%',
        height: Platform.OS == 'ios' ? verticalScale(73) : verticalScale(55),
        backgroundColor: colors.neutral800,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        borderTopColor: colors.neutral700,
        borderTopWidth: 1,
    },
    tabbarItem : {
        flex: 1,
        marginBottom: Platform.OS == 'ios' ? spacingY._10: spacingY._5,
        justifyContent: 'center',
        alignItems: 'center',
    },
})