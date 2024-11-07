import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { Queries, QueryPersistanceKeys } from "../constants/query";
import { MovieSearchQueryData } from "../types/Movie";

export const usePersistentSearch = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    loadLastSearchData();
  }, []);

  useEffect(() => {
    if (query) {
      AsyncStorage.setItem(QueryPersistanceKeys.LAST_QUERY, query);
    }
    AsyncStorage.setItem(
      QueryPersistanceKeys.LAST_PAGE,
      currentPage.toString()
    );
  }, [query, currentPage]);

  const loadLastSearchData = async () => {
    const storedQuery = await AsyncStorage.getItem(
      QueryPersistanceKeys.LAST_QUERY
    );
    const storedPage = await AsyncStorage.getItem(
      QueryPersistanceKeys.LAST_PAGE
    );

    if (storedQuery) {
      setQuery(storedQuery);
    }
    if (storedPage) {
      setCurrentPage(Number(storedPage));
    }

    const cachedQueryData = queryClient.getQueryData<MovieSearchQueryData>([
      Queries.SEARCH_MOVIES,
      storedQuery,
    ]);

    if (cachedQueryData) {
      console.log(
        "Cached movies found:",
        cachedQueryData.pages.flatMap((page) => page.movies)
      );
    }
  };

  return { query, setQuery, currentPage, setCurrentPage };
};
