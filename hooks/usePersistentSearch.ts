import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryPersistanceKeys } from "../constants/query";

export const usePersistentSearch = () => {
  const [query, setQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const loadLastSearchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadLastSearchData();
  }, [loadLastSearchData]);

  useEffect(() => {
    if (query) {
      AsyncStorage.setItem(QueryPersistanceKeys.LAST_QUERY, query);
    }
    AsyncStorage.setItem(
      QueryPersistanceKeys.LAST_PAGE,
      currentPage.toString()
    );
  }, [query, currentPage]);

  return { query, setQuery, currentPage, setCurrentPage };
};
