using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using HtmlAgilityPack;

namespace lawrukmvc.Helpers
{
    public class HTMLParser
    {
        public static string GetTable(string url, int tableIndex)
        {
            return GetTable(url, tableIndex, int.MaxValue);
        }

        public static string GetTables(string url)
        {
            StringBuilder tables = new StringBuilder();
            HtmlNodeCollection nodes = GetTableNodes(url);
            if (nodes == null)
                return "";
            
            foreach (HtmlNode node in nodes)
            {
                tables.Append(GetTableTextFromHtmlNode(node,false));
            }
            return tables.ToString();
        }

        public static HtmlNode GetTableNode(string url, int tableIndex, int columnMax)
        {
            HtmlNodeCollection nodes = GetTableNodes(url);
            return nodes[tableIndex];            
        }

        public static string GetTable(string url, int tableIndex, int columnMax)
        {
            return GetTableNode(url, tableIndex, columnMax).OuterHtml;
        }

        public static HtmlNodeCollection GetTableNodes(string url)
        {
            var htmlNode = GetDocumentNode(url);
            return htmlNode.SelectNodes("//table");
        }

        public static HtmlNodeCollection GetTableNodes2(string url)
        {
            var htmlNode = GetDocumentNode(url);
            return htmlNode.SelectNodes("html/body/table");
        }

        public static HtmlNode GetTable2(string url, int index)
        {
            return GetTableNodes2(url)[index];
        }

        public static HtmlNode GetNode(HtmlNode node, string tag, int index)
        {
            var nodes = node.SelectNodes(tag);
            return nodes[index];
        }

        private static HtmlNode GetDocumentNode(string url)
        {
            HtmlDocument doc = new HtmlDocument();
            string html = Helpers.DownloadString(url);
            doc.LoadHtml(html);
            return doc.DocumentNode;
        }        

        public static HtmlNodeCollection GetTableNodes(string url, int tableIndex)
        {
            var node = GetTableNode(url, tableIndex, int.MaxValue);
            return node.SelectNodes("tr");
        }

        public static string GetTableTextFromHtmlNode(HtmlNode node, bool removeColspanRow, int columnMax = int.MaxValue)
        {
            var table = new StringBuilder("<table>");
            HtmlNodeCollection nodeCollection;
            nodeCollection = node.SelectNodes("thead|tbody");
            if (nodeCollection == null)
            {
                table = CleanTRs(node, table, removeColspanRow, columnMax);
            }
            else
            {
                foreach (HtmlNode n in nodeCollection)
                {
                    table = CleanTRs(n, table, removeColspanRow, columnMax);
                }
            }
            table.Append("</table>");
            return table.ToString();
        }

        private static StringBuilder CleanTRs(HtmlNode n, StringBuilder table, bool removeColspanRow, int columnMax)
        {
            var htmlNodes = n.SelectNodes("tr");
            if (htmlNodes != null)
            {
                foreach (HtmlNode row in htmlNodes)
                {
                    string rowOuterHTML = row.OuterHtml.ToLower();
                    if (!removeColspanRow || !rowOuterHTML.Contains("colspan") || rowOuterHTML.Contains("colspan=\"1\""))//remove colspan row
                    {
                        table.Append("<tr>\n");
                        int columnCount = 0;
                        foreach (HtmlNode cell in row.SelectNodes("th|td"))
                        {
                            table.Append("<" + cell.Name + ">" + cell.InnerHtml + "</" + cell.Name + ">\n");
                            columnCount++;
                            if (columnCount >= columnMax)
                            {
                                break;
                            }
                        }
                        table.Append("</tr>\n");
                    }
                }
            }
            return table;
        }

        private static void CleanTRs2(HtmlNode n, StringBuilder table, bool removeColspanRow, int columnMax)
        {
            var htmlNodes = n.SelectNodes("tr");
            if (htmlNodes != null)
            {
                foreach (HtmlNode row in htmlNodes)
                {
                    string rowOuterHTML = row.OuterHtml.ToLower();
                    if (!removeColspanRow || !rowOuterHTML.Contains("colspan") || rowOuterHTML.Contains("colspan=\"1\""))//remove colspan row
                    {
                        table.Append("<tr>\n");
                        int columnCount = 0;
                        foreach (HtmlNode cell in row.SelectNodes("th|td"))
                        {
                            HtmlNodeCollection innerTables = cell.SelectNodes("table");
                            if (innerTables != null)
                            {
                                foreach (HtmlNode node in innerTables)
                                {
                                    node.Attributes.RemoveAll();
                                }
                            }
                            table.Append("<" + cell.Name + ">" + cell.InnerHtml + "</" + cell.Name + ">\n");
                            columnCount++;
                            if (columnCount >= columnMax)
                            {
                                break;
                            }
                        }
                        table.Append("</tr>\n");
                    }
                }
            }            
        }

        private static string GetTableWithNoBody(HtmlNode node)
        {
            return node.OuterHtml;
        }
    }
}
