<%@ Page Title="" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<lawrukmvc.ViewModels.FamousDeveloperViewModel>" %>
<%@ Import Namespace="lawrukmvc.Helpers" %>

<asp:Content ID="Content3" ContentPlaceHolderID="HeadTitleContent" runat="server">
	<%=Model.Title %>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">    
        
    <h2><%=Model.Title %></h2>
    <%=Helpers.Img(Model.FamousDeveloper.PhotoUrl)%>
    <%=Model.ProfileLinks %>    
    <%=Helpers.P("Nickname", Model.FamousDeveloper.Nickname) %>
    <p><%=Model.FamousDeveloper.Summary %></p>
    <%=Helpers.UrlList(Model.FamousDeveloper.Books) %>
    <%=Helpers.UrlList(Model.FamousDeveloper.Websites) %>
    <%=Helpers.P("Primary Langauge", Model.FamousDeveloper.PrimaryLanguage) %>
    
    <%=Model.MoreDevelopersOfTheSameLanguage%>
    <p><a href="/famousdevs">Full List</a></p>
   
</asp:Content>