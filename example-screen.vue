<template>
  <nb-container>
    <header-simple
      :title="$t('Программы тренировок')"
      :loading="loading"
    ></header-simple>

    <ResourceList
      :contentContainerStyle="{paddingBottom: 32}"
      :refresh="refreshData"
      :loading="loading"
      :navigation="navigation"
      :data="courses"
      :meta="coursesMeta"
    >
      <view
        :style="{
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 16,
          paddingBottom: 16,
          paddingTop: 8,
        }"
        render-prop="ListHeaderComponent"
      >
        <CourseFilterButton
          v-if="filtersAddonIsActive"
          :navigation="navigation"
        />

        <TagsFilter
          :style="{marginLeft: 8}"
          v-else-if="tagsList && tagsList.length"
          :all-tags="tagsList"
          :selected-tags="tags"
          :onPress="selectTag"
        />
      </view>

      <!-- RF: create separate component for empty text -->
      <view render-prop="ListEmptyComponent">
        <View
          v-if="!loading"
          :style="{flex: 1, flexDirection: 'column', alignItems: 'center'}"
        >
          <Emoji
            :name="'woman-shrugging'"
            :style="{fontSize: 40, marginTop: 16, marginBottom: 8}"
          />
          <FontText :style="{marginBottom: 8}">{{
            $t('Ничего не найдено')
          }}</FontText>

          <nb-button
            v-if="filters.length > 0 || tags.length > 0"
            full
            light
            iconRight
            :style="{marginHorizontal: 'auto', marginVertical: 16}"
            :onPress="() => clearFilters()"
          >
            <font-text :style="{marginRight: 8}">{{
              $t('Сбросить поиск')
            }}</font-text>
            <nb-icon name="close" :style="{marginTop: 1, color: '#777777'}" />
          </nb-button>
        </View>
      </view>

      <CourseItem
        render-prop-fn="renderItem"
        :item="args.item"
        :onPress="
          () => {
            navigation.navigate('CoursesShow', args.item);
          }
        "
      >
      </CourseItem>

      <view render-prop="ListFooterComponent" :style="{paddingBottom: 64}">
        <!-- Waiting products -->
        <WaitingProducts
          v-if="products.length > 0"
          :navigation="navigation"
          :products="products"
        />

        <!-- Select new courses -->
        <nb-body v-if="courses.length > 0" :style="{marginVertical: 16}">
          <nb-button
            light
            :style="{paddingHorizontal: 16}"
            small
            rounded
            :onPress="
              () => {
                navigation.navigate('Products');
              }
            "
          >
            <font-text>{{ $t('Подписка') }}</font-text>
          </nb-button>
        </nb-body>

        <ExpiredCourses
          v-if="expiredCourses.length > 0"
          :courses="expiredCourses"
          :onPress="
            item => {
              navigation.navigate('CoursesShow', item);
            }
          "
        />
      </view>
    </ResourceList>

    <footer :navigation="navigation"></footer>
  </nb-container>
</template>

<script>
import Footer from '../../../components/Footer';
import HeaderSimple from '../../../components/HeaderSimple';
import ResourceList from '../../../components/common/ResourceList';
import store from '../../../store';
import HeaderButton from '../../../components/partials/HeaderButton';
import FontText from '../../../components/FontText';
import Emoji from 'react-native-emoji';
import {COLORS} from '../../../config/Styles';
import CourseItem from '../../../components/student/courses/index/CourseItem';
import WaitingProducts from '../../../components/student/courses/index/WaitingProducts';
import ExpiredCourses from '../../../components/student/courses/index/ExpiredCourses';
import TagsFilter from '../../../components/common/TagsFilter';
import _ from 'lodash';
import CourseFilterButton from '../../../components/student/courses/index/CourseFilterButton';

export default {
  name: 'CoursesIndex',
  components: {
    CourseFilterButton,
    TagsFilter,
    ExpiredCourses,
    WaitingProducts,
    CourseItem,
    FontText,
    HeaderButton,
    HeaderSimple,
    Footer,
    ResourceList,
    Emoji,
  },
  props: ['navigation'],
  data() {
    return {
      tags: [],
      colors: {
        greyText: COLORS.greyDark,
      },
    };
  },
  computed: {
    courses() {
      return store.state.auth.courses.list;
    },
    tagsList() {
      return store.state.auth.courses.meta.tags;
    },
    filters() {
      return store.state.auth.courses.filters || [];
    },
    filtersAddonIsActive() {
      return store.getters.ADDONS_COURSE_FILTERS;
    },
    expiredCourses() {
      return store.state.auth.courses.expired;
    },
    products() {
      return store.state.auth.courses.products;
    },
    coursesMeta() {
      return store.state.auth.courses.meta;
    },
    loading() {
      return store.state.auth.courses.loading;
    },
  },
  methods: {
    async clearFilters() {
      this.tags = [];

      await store.dispatch('SELECT_STUDENT_COURSES_TAGS');

      await store.dispatch('SELECT_STUDENT_COURSES_FILTERS');

      this.refreshData();
    },
    async selectTag(tag) {
      if (_.includes(this.tags, tag)) {
        _.remove(this.tags, t => {
          return t === tag;
        });
      } else {
        // Single mode
        this.tags = [tag];

        // Multiple mode
        // this.tags.push(tag)
      }

      await store.dispatch('SELECT_STUDENT_COURSES_TAGS', this.tags);

      this.refreshData();
    },
    refreshData() {
      console.log('StudentCoursesIndex.methods.refreshData');

      store.dispatch('FETCH_STUDENT_COURSES');
    },
  },
};
</script>
