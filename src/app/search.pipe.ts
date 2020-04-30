import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "search",
})
export class SearchPipe implements PipeTransform {
  transform(value: any[], term: string): any[] {
    return value.filter(
      (x: any) =>
        x.post_title.toLowerCase().includes(term.toLowerCase()) ||
        x.post_content.toLowerCase().includes(term.toLowerCase())
    );
  }
}
