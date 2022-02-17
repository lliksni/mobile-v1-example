import React, {useEffect, useRef, useState} from 'react';
import {
    Button,
    Container,
    Content,
    Icon,
    Spinner,
    Text,
    View,
} from 'native-base';
import {StackNavigationProp} from 'react-navigation-stack/lib/typescript/src/vendor/types';
import {SafeAreaView, TouchableOpacity} from 'react-native';
import {Platform} from 'react-native';
import {COLORS} from '../../../config/Styles';
import {StatusBar} from 'expo-status-bar';
import FontText from '../../../components/FontText.vue';
import store from '../../../store';
import _ from 'lodash';
import CheckboxWithKeys from '../../../components/common/forms/fields/CheckboxWithKeys';

const FILTERS_DATA = [
    {
        name: 'place',
        label: 'Где тренируешься?',
        options: [
            {
                value: 'home',
                label: 'Дома',
            },
            {
                value: 'gym',
                label: 'В зале',
            },
        ],
    },
    {
        name: 'goal',
        label: 'Цель',
        options: [
            {
                value: 'slim',
                label: 'Похудение',
            },
            {
                value: 'regular',
                label: 'Поддержание',
            },
            {
                value: 'gain',
                label: 'Набор ММ',
            },
            {
                value: 'stretching',
                label: 'Растяжка',
            },
        ],
    },
    {
        name: 'level',
        label: 'Уровень подготовки',
        options: [
            {
                value: 'new',
                label: 'Новичок',
            },
            {
                value: 'basic',
                label: 'Средний',
            },
            {
                value: 'advanced',
                label: 'Продвинутый',
            },
        ],
    },
    {
        name: 'equipment',
        label: 'Инвентарь',
        options: [
            {
                value: 'none',
                label: 'Без оборудования',
            },
            {
                value: 'tape',
                label: 'Ленты',
            },
            {
                value: 'dumbbell',
                label: 'Гантели',
            },
        ],
    },
    {
        name: 'restrictions',
        label: 'Ограничения',
        options: [
            {
                value: 'none',
                label: 'Без ограничений',
            },
            {
                value: 'knees',
                label: 'Больные колени',
            },
            {
                value: 'back',
                label: 'Больная спина',
            },
            {
                value: 'varicose',
                label: 'Варикоз',
            },
            {
                value: 'pregnancy',
                label: 'После беременности / диастаз',
            },
        ],
    },
];
interface PropType {
    navigation: StackNavigationProp;
}

export interface FilterType {
    key: string;
    value: string[];
}

const fetchCourses = async (
    filters?: Array<{key: string; value: string | Array<string>}>,
) => {
    await store.dispatch('SELECT_STUDENT_COURSES_FILTERS', filters);
    store.dispatch('FETCH_STUDENT_COURSES');
};

const CourseFilter = (props: PropType) => {
    const isMounted = useRef(false);

    // Init params
    const initFilters: FilterType[] = store.state.auth.courses?.filters || [];
    const initCourses: any[] = store.state.auth.courses.list || [];

    // State
    const [coursesCount, setCoursesCount] = useState(initCourses.length);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState(initFilters);

    // Methods
    const debouncedSearch = _.debounce(fetchCourses, 200);

    // Store updates
    useEffect(() => {
        const unsubscribe = store.subscribe((mutation: any) => {
            if (mutation.type === 'STUDENT_COURSES_FETCHED') {
                setCoursesCount(mutation.payload.data.length);
                setLoading(false);
            }
            if (mutation.type === 'FETCHING_STUDENT_COURSES') {
                setLoading(true);
            }
        });

        return () => unsubscribe();
    });

    // Search when filter is changed
    useEffect(() => {
        if (isMounted.current) {
            debouncedSearch(filters);
        } else {
            isMounted.current = true;
        }
    }, [JSON.stringify(filters)]);

    const onCheckboxChange = (filterKey: string, filterValues: string[]) => {
        setFilters((prev: Array<{key: string; value: string[]}>) => {
            let newStateVal = prev;
            const filterIndex = newStateVal.findIndex(i => i.key === filterKey);
            // Not found
            if (filterIndex < 0) {
                return [
                    ...newStateVal,
                    {
                        key: filterKey,
                        value: filterValues,
                    },
                ];
            }
            // Founded
            newStateVal = newStateVal.filter(i => i.key !== filterKey);
            // , replace
            if (filterValues.length > 0) {
                return [
                    ...newStateVal,
                    {
                        key: filterKey,
                        value: filterValues,
                    },
                ];
            }
            // Founded, but null
            return newStateVal;
        });
    };
    const clearFilters = () => {
        setFilters([]);
    };

    return (
        <Container>
            <Header
                title={'Фильтр'}
                back={() => props.navigation.goBack()}
                onClear={() => clearFilters()}
                loading={loading}
                showClear={!!filters.length}
            />
            <Content padder contentContainerStyle={{paddingBottom: 100}}>
                {FILTERS_DATA.map((filterItem, index) => (
                    <CheckboxWithKeys
                        key={index}
                        initKeys={filters.find(i => i.key === filterItem.name)?.value}
                        label={filterItem.label}
                        options={filterItem.options}
                        loading={loading}
                        onChange={keys => onCheckboxChange(filterItem.name, keys)}
                    />
                ))}
            </Content>

            <SafeAreaView>
                <View style={{paddingHorizontal: 20, paddingVertical: 16}}>
                    <Button
                        disabled={loading || coursesCount === 0}
                        block
                        onPress={() => props.navigation.goBack()}>
                        {loading ? (
                            <Spinner color={'gray'} size={'small'} />
                        ) : (
                            <Text>
                                {coursesCount > 0
                                    ? `Показать результаты: ${coursesCount}`
                                    : 'Ничего не надено'}
                            </Text>
                        )}
                    </Button>
                </View>
            </SafeAreaView>
        </Container>
    );
};

const isIos = Platform.OS === 'ios';

interface HeaderPropType {
    title: string;
    back: () => void;
    onClear: () => void;
    loading?: boolean;
    showClear?: boolean;
}

const Header = ({title, back, onClear, loading, showClear}: HeaderPropType) => {
    return (
        <SafeAreaView
            style={{paddingTop: isIos ? 0 : 16, backgroundColor: COLORS.greyLighter}}>
            <StatusBar bar-style={'dark-content'} translucent />
            <View style={{paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8}}>
                <View
                    style={{
                        height: 32,
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                    }}>
                    <View
                        style={{height: 32, flexDirection: 'row', alignItems: 'center'}}>
                        <TouchableOpacity style={{paddingRight: 16}} onPress={back}>
                            <Icon name={'arrow-back'} />
                        </TouchableOpacity>
                        <FontText size={18} bold>
                            {title}
                        </FontText>
                        {loading && (
                            <Spinner size={'small'} style={{marginLeft: 8}} color={'gray'} />
                        )}
                    </View>
                    {showClear && (
                        <Button
                            disabled={loading}
                            small
                            transparent
                            onPress={() => onClear()}>
                            <Text>Сбросить</Text>
                        </Button>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};
export default CourseFilter;
