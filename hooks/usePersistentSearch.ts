import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryPersistanceKeys } from "../constants/query";

export const usePersistentSearch = () => {
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
  };

  return { query, setQuery, currentPage, setCurrentPage };
};
